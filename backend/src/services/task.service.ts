import { Types } from "mongoose";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { TaskPriorityEnum, TaskStatusEnum, TaskStatusEnumType } from "../enums/task.enum";
import BoardModel from "../models/board.model";
import EpicModel from "../models/epic.model";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel, { TaskDocument } from "../models/task.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { createNotification, processCommentNotifications } from "./notification.service";
import { NotificationType } from "../models/notification.model";
import TeamModel from "../models/team.model";
import OrganizationModel from "../models/organization.model";

export const createTaskService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string[];
    startDate?: string;
    dueDate?: string;
    epic?: string;
    board: string;
    parent?: string;
    customFields?: { key: string; value: any }[];
  },
  teamId?: string,
  organizationId?: string
) => {
  const { 
    title, 
    description, 
    priority, 
    status, 
    assignedTo, 
    startDate,
    dueDate, 
    epic,
    board,
    parent,
    customFields
  } = body;

  const project = await ProjectModel.findById(projectId);
  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  // Validate organization and team IDs
  let team, organization;
  if (teamId) {
    team = await TeamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException("Team not found");
    }
  }

  if (organizationId) {
    organization = await OrganizationModel.findById(organizationId);
    if (!organization) {
      throw new NotFoundException("Organization not found");
    }
  }

  // Validate the board exists
  const boardObj = await BoardModel.findById(board);
  if (!boardObj || boardObj.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Board not found or does not belong to this project"
    );
  }

  // Validate epic if provided
  if (epic) {
    const epicObj = await EpicModel.findById(epic);
    if (!epicObj || epicObj.project.toString() !== projectId.toString()) {
      throw new NotFoundException(
        "Epic not found or does not belong to this project"
      );
    }
  }

  // Validate parent task if provided
  if (parent) {
    const parentTask = await TaskModel.findById(parent);
    if (!parentTask || parentTask.project.toString() !== projectId.toString()) {
      throw new NotFoundException(
        "Parent task not found or does not belong to this project"
      );
    }
  }

  // Validate assignees are members of workspace
  if (assignedTo && assignedTo.length > 0) {
    for (const assigneeId of assignedTo) {
      const isAssignedUserMember = await MemberModel.exists({
        userId: assigneeId,
        workspaceId,
      });

      if (!isAssignedUserMember) {
        throw new Error(`User ${assigneeId} is not a member of this workspace.`);
      }
    }
  }

  const task = new TaskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    assignedTo: assignedTo || [],
    startDate: startDate ? new Date(startDate) : null,
    dueDate: dueDate ? new Date(dueDate) : null,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    organization: organizationId,
    team: teamId,
    board,
    epic: epic || null,
    parent: parent || null,
    isSubtask: parent ? true : false,
    customFields: customFields || []
  });

  await task.save();

  // If this is a subtask, add a reference to it in the parent task
  if (parent) {
    await TaskModel.findByIdAndUpdate(parent, {
      $push: { subtasks: task._id }
    });
  }

  // Send notifications to assigned users
  if (assignedTo && assignedTo.length > 0) {
    for (const assigneeId of assignedTo) {
      await createNotification({
        recipientId: new Types.ObjectId(assigneeId),
        senderId: new Types.ObjectId(userId),
        type: NotificationType.TASK_ASSIGNED,
        taskId: toObjectIdOrUndefined(task._id),
        projectId: new Types.ObjectId(projectId),
        workspaceId: new Types.ObjectId(workspaceId),
        content: `You've been assigned to task "${task.title}"`,
      });
    }
  }

  return { task };
};

// Create a subtask
function toObjectIdOrUndefined(val: unknown): Types.ObjectId | undefined {
  if (!val) return undefined;
  if (val instanceof Types.ObjectId) return val;
  if (typeof val === 'string') return new Types.ObjectId(val);
  return undefined;
}

export const createSubtaskService = async (
  workspaceId: string,
  projectId: string,
  parentTaskId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string[];
    startDate?: string;
    dueDate?: string;
    customFields?: { key: string; value: any }[];
  }
) => {
  const { 
    title, 
    description, 
    priority, 
    status, 
    assignedTo, 
    startDate,
    dueDate,
    customFields
  } = body;

  // Validate parent task
  const parentTask = await TaskModel.findOne({
    _id: parentTaskId,
    workspace: workspaceId,
    project: projectId
  }) as TaskDocument | null; // Explicitly type as TaskDocument or null

  if (!parentTask) {
    throw new NotFoundException(
      "Parent task not found or does not belong to this project/workspace"
    );
  }

  // Validate assignees
  if (assignedTo && assignedTo.length > 0) {
    for (const assigneeId of assignedTo) {
      const isAssignedUserMember = await MemberModel.exists({
        userId: assigneeId,
        workspaceId,
      });

      if (!isAssignedUserMember) {
        throw new Error(`User ${assigneeId} is not a member of this workspace.`);
      }
    }
  }

  // Create the subtask
  const subtask = new TaskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    assignedTo: assignedTo || [],
    startDate: startDate ? new Date(startDate) : null,
    dueDate: dueDate ? new Date(dueDate) : null,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    organization: toObjectIdOrUndefined(parentTask.organization),
    team: toObjectIdOrUndefined(parentTask.team),
    board: parentTask.board,
    epic: toObjectIdOrUndefined(parentTask.epic),
    parent: parentTaskId,
    isSubtask: true,
    customFields: customFields || []
  });

  await subtask.save();

  // Update the parent task with the subtask reference
  await TaskModel.findByIdAndUpdate(parentTaskId, {
    $push: { subtasks: subtask._id }
  });

  return { subtask };
};

// Get subtasks for a parent task
export const getSubtasksService = async (
  workspaceId: string,
  projectId: string,
  parentTaskId: string
) => {
  const subtasks = await TaskModel.find({
    parent: parentTaskId,
    isSubtask: true,
    workspace: workspaceId,
    project: projectId
  }).populate("assignedTo", "name email profilePicture -password");

  return { subtasks };
};

// Get tasks by board
export const getTasksByBoardService = async (
  workspaceId: string,
  projectId: string,
  boardId: string
) => {
  const board = await BoardModel.findOne({
    _id: boardId,
    workspace: workspaceId,
    project: projectId
  });

  if (!board) {
    throw new NotFoundException(
      "Board not found or does not belong to this project/workspace"
    );
  }

  const tasks = await TaskModel.find({
    board: boardId,
    workspace: workspaceId,
    project: projectId,
    isSubtask: false // Don't include subtasks in board view
  }).populate("assignedTo", "name email profilePicture -password")
    .populate("epic", "name");

  return { tasks };
};

// Get tasks by epic
export const getTasksByEpicService = async (
  workspaceId: string,
  projectId: string,
  epicId: string
) => {
  const epic = await EpicModel.findOne({
    _id: epicId,
    workspace: workspaceId,
    project: projectId
  });

  if (!epic) {
    throw new NotFoundException(
      "Epic not found or does not belong to this project/workspace"
    );
  }

  const tasks = await TaskModel.find({
    epic: epicId,
    workspace: workspaceId,
    project: projectId,
    isSubtask: false // Don't include subtasks in epic view
  }).populate("assignedTo", "name email profilePicture -password")
    .populate("board", "name type");

  return { tasks };
};

// Move task to another board
export const moveTaskToBoardService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  boardId: string
) => {
  // Validate board
  const board = await BoardModel.findOne({
    _id: boardId,
    workspace: workspaceId,
    project: projectId
  });

  if (!board) {
    throw new NotFoundException(
      "Board not found or does not belong to this project/workspace"
    );
  }

  // Validate task
  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId
  });

  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to this project/workspace"
    );
  }

  // Update task's board
  task.board = new Types.ObjectId(boardId);
  await task.save();

  return { task };
};

// Move task to epic
export const moveTaskToEpicService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  epicId: string
) => {
  // Validate epic
  const epic = await EpicModel.findOne({
    _id: epicId,
    workspace: workspaceId,
    project: projectId
  });

  if (!epic) {
    throw new NotFoundException(
      "Epic not found or does not belong to this project/workspace"
    );
  }

  // Validate task
  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId
  });

  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to this project/workspace"
    );
  }

  // Update task's epic
  task.epic = new Types.ObjectId(epicId);
  await task.save();

  return { task };
};

// Update to support multiple assignees
export const assignTaskService = async (
  workspaceId: Types.ObjectId,
  projectId: Types.ObjectId,
  taskId: Types.ObjectId,
  assigneeIds: string[], // Now accepts an array of assignees
  senderId: Types.ObjectId) => {
  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  });

  if (!task) {
    throw new NotFoundException("Task not found", ErrorCodeEnum.TASK_NOT_FOUND);
  }

  // Check if all assignees are members of the workspace
  for (const assigneeId of assigneeIds) {
    const isMember = await MemberModel.exists({
      userId: assigneeId,
      workspaceId,
    });

    if (!isMember) {
      throw new BadRequestException(
        `User ${assigneeId} is not a member of this workspace`,
        ErrorCodeEnum.MEMBER_NOT_FOUND
      );
    }
  }

  // Update the assignees
  task.assignedTo = assigneeIds.map(id => new Types.ObjectId(id));
  await task.save();
  
  // Create notifications for the assignees
  for (const assigneeId of assigneeIds) {
    await createNotification({
      recipientId: new Types.ObjectId(assigneeId),
      senderId: senderId,
      type: NotificationType.TASK_ASSIGNED,
      taskId: taskId,
      projectId,
      workspaceId,
      content: `You've been assigned to task "${task.title}"`,
    });
  }
  
  return { task };
};

export const updateTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string[] | null; // Updated to support multiple assignees
    dueDate?: string;
    customFields?: { key: string; value: any }[];
  }
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findById(taskId);

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Task not found or does not belong to this project"
    );
  }

  // Validate assignees are members of workspace
  if (body.assignedTo && body.assignedTo.length > 0) {
    for (const assigneeId of body.assignedTo) {
      const isAssignedUserMember = await MemberModel.exists({
        userId: assigneeId,
        workspaceId,
      });

      if (!isAssignedUserMember) {
        throw new Error(`User ${assigneeId} is not a member of this workspace.`);
      }
    }
  }

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    {
      ...body,
    },
    { new: true }
  );

  if (!updatedTask) {
    throw new BadRequestException("Failed to update task");
  }

  return { updatedTask };
};

export const getAllTasksService = async (
  workspaceId: string,
  filters: {
    projectId?: string;
    status?: string[];
    priority?: string[];
    assignedTo?: string[];
    keyword?: string;
    dueDate?: string;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
  };

  if (filters.projectId) {
    query.project = filters.projectId;
  }

  if (filters.status && filters.status?.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.priority && filters.priority?.length > 0) {
    query.priority = { $in: filters.priority };
  }

  if (filters.assignedTo && filters.assignedTo?.length > 0) {
    query.assignedTo = { $in: filters.assignedTo };
  }

  if (filters.keyword && filters.keyword !== undefined) {
    query.title = { $regex: filters.keyword, $options: "i" };
  }

  if (filters.dueDate) {
    query.dueDate = {
      $eq: new Date(filters.dueDate),
    };
  }

  //Pagination Setup
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "_id name profilePicture -password")
      .populate("project", "_id emoji name"),
    TaskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTaskByIdService = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  }).populate("assignedTo", "_id name profilePicture -password");

  if (!task) {
    throw new NotFoundException("Task not found.");
  }

  return task;
};

export const deleteTaskService = async (
  workspaceId: string,
  taskId: string
) => {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to the specified workspace"
    );
  }

  return;
};

export const updateTaskStatusService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  status: TaskStatusEnumType
) => {
  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  });

  if (!task) {
    throw new NotFoundException("Task not found", ErrorCodeEnum.TASK_NOT_FOUND);
  }

  task.status = status;
  const updatedTask = await task.save();
  
  return { updatedTask };
};

export const getTasksBoardService = async (
  workspaceId: string,
  projectId: string
) => {
  const tasks = await TaskModel.find({
    workspace: workspaceId,
    project: projectId,
  }).populate("assignedTo", "name email avatar");

  // Group tasks by status
  const columns = {
    backlog: tasks.filter((task:TaskDocument) => task.status === TaskStatusEnum.BACKLOG),
    ready: tasks.filter(task => task.status === TaskStatusEnum.READY),
    in_progress: tasks.filter(task => task.status === TaskStatusEnum.IN_PROGRESS),
    review: tasks.filter(task => task.status === TaskStatusEnum.IN_REVIEW),
    done: tasks.filter(task => task.status === TaskStatusEnum.DONE),
  };
  
  return { columns };
};


export const getTaskCommentsService = async (taskId: string) => {
  const task = await TaskModel.findById(taskId).populate({
    path: "comments.author",
    select: "name email avatar",
  });

  if (!task) {
    throw new NotFoundException("Task not found", ErrorCodeEnum.TASK_NOT_FOUND);
  }

  return { comments: task.comments };
};

export const addTaskCommentService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  userId: string,
  content: string
) => {
  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  });

  if (!task) {
    throw new NotFoundException("Task not found", ErrorCodeEnum.TASK_NOT_FOUND);
  }

  const comment = {
    content,
    author: userId,
  };

  task.comments.push(comment);
  await task.save();
  
  // Process notifications for mentions and task participants
  await processCommentNotifications(content,  new Types.ObjectId(userId), new Types.ObjectId(taskId), new Types.ObjectId(projectId), workspaceId);
  
  return { comment };
};