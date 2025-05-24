import {
  Roles,
  Permissions,
  PermissionType,
  RoleType,
} from "../enums/role.enum";

export const RolePermissions: Record<RoleType, Array<PermissionType>> = {
  // Organization level roles
  ORG_OWNER: [
    // Organization permissions
    Permissions.CREATE_ORGANIZATION,
    Permissions.DELETE_ORGANIZATION,
    Permissions.EDIT_ORGANIZATION,
    Permissions.MANAGE_ORGANIZATION_SETTINGS,
    
    // Department permissions
    Permissions.CREATE_DEPARTMENT,
    Permissions.DELETE_DEPARTMENT,
    Permissions.EDIT_DEPARTMENT,
    Permissions.MANAGE_DEPARTMENT_SETTINGS,
    
    // Team permissions
    Permissions.CREATE_TEAM,
    Permissions.DELETE_TEAM,
    Permissions.EDIT_TEAM,
    Permissions.MANAGE_TEAM_SETTINGS,
    
    // Workspace permissions
    Permissions.CREATE_WORKSPACE,
    Permissions.DELETE_WORKSPACE,
    Permissions.EDIT_WORKSPACE,
    Permissions.MANAGE_WORKSPACE_SETTINGS,
    
    // Member management
    Permissions.ADD_MEMBER,
    Permissions.CHANGE_MEMBER_ROLE,
    Permissions.REMOVE_MEMBER,
    
    // Project permissions
    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    Permissions.DELETE_PROJECT,
    Permissions.MANAGE_PROJECT,
    
    // Board permissions
    Permissions.CREATE_BOARD,
    Permissions.EDIT_BOARD,
    Permissions.DELETE_BOARD,
    Permissions.CHANGE_BOARD_TYPE,
    
    // Epic permissions
    Permissions.CREATE_EPIC,
    Permissions.EDIT_EPIC,
    Permissions.DELETE_EPIC,
    
    // Task permissions
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.DELETE_TASK,
    Permissions.COMMENT_ON_TASK,
    Permissions.ASSIGN_TASK,
    Permissions.CREATE_SUBTASK,
    
    // Sprint permissions
    Permissions.CREATE_SPRINT,
    Permissions.EDIT_SPRINT,
    Permissions.DELETE_SPRINT,
    Permissions.START_SPRINT,
    Permissions.COMPLETE_SPRINT,
    
    // Basic permission
    Permissions.VIEW_ONLY,
  ],
  
  ORG_ADMIN: [
    // Organization permissions
    Permissions.EDIT_ORGANIZATION,
    Permissions.MANAGE_ORGANIZATION_SETTINGS,
    
    // Department permissions
    Permissions.CREATE_DEPARTMENT,
    Permissions.EDIT_DEPARTMENT,
    Permissions.MANAGE_DEPARTMENT_SETTINGS,
    
    // Team permissions
    Permissions.CREATE_TEAM,
    Permissions.EDIT_TEAM,
    Permissions.MANAGE_TEAM_SETTINGS,
    
    // Workspace permissions
    Permissions.CREATE_WORKSPACE,
    Permissions.EDIT_WORKSPACE,
    Permissions.MANAGE_WORKSPACE_SETTINGS,
    
    // Member management
    Permissions.ADD_MEMBER,
    Permissions.CHANGE_MEMBER_ROLE,
    Permissions.REMOVE_MEMBER,
    
    // Project permissions
    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    Permissions.MANAGE_PROJECT,
    
    // Board permissions
    Permissions.CREATE_BOARD,
    Permissions.EDIT_BOARD,
    Permissions.CHANGE_BOARD_TYPE,
    
    // Epic permissions
    Permissions.CREATE_EPIC,
    Permissions.EDIT_EPIC,
    
    // Task permissions
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.COMMENT_ON_TASK,
    Permissions.ASSIGN_TASK,
    Permissions.CREATE_SUBTASK,
    
    // Sprint permissions
    Permissions.CREATE_SPRINT,
    Permissions.EDIT_SPRINT,
    Permissions.START_SPRINT,
    Permissions.COMPLETE_SPRINT,
    
    // Basic permission
    Permissions.VIEW_ONLY,
  ],
  
  // Department level roles
  DEPT_HEAD: [
    // Department permissions
    Permissions.EDIT_DEPARTMENT,
    Permissions.MANAGE_DEPARTMENT_SETTINGS,
    
    // Team permissions
    Permissions.CREATE_TEAM,
    Permissions.EDIT_TEAM,
    Permissions.MANAGE_TEAM_SETTINGS,
    
    // Workspace permissions
    Permissions.CREATE_WORKSPACE,
    Permissions.EDIT_WORKSPACE,
    
    // Member management
    Permissions.ADD_MEMBER,
    Permissions.CHANGE_MEMBER_ROLE,
    
    // Project permissions
    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    Permissions.MANAGE_PROJECT,
    
    // Board permissions
    Permissions.CREATE_BOARD,
    Permissions.EDIT_BOARD,
    Permissions.CHANGE_BOARD_TYPE,
    
    // Epic permissions
    Permissions.CREATE_EPIC,
    Permissions.EDIT_EPIC,
    
    // Task permissions
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.COMMENT_ON_TASK,
    Permissions.ASSIGN_TASK,
    Permissions.CREATE_SUBTASK,
    
    // Sprint permissions
    Permissions.CREATE_SPRINT,
    Permissions.EDIT_SPRINT,
    Permissions.START_SPRINT,
    Permissions.COMPLETE_SPRINT,
    
    // Basic permission
    Permissions.VIEW_ONLY,
  ],
  
  DEPT_ADMIN: [
    // Team permissions
    Permissions.CREATE_TEAM,
    Permissions.EDIT_TEAM,
    
    // Workspace permissions
    Permissions.CREATE_WORKSPACE,
    
    // Member management
    Permissions.ADD_MEMBER,
    
    // Project permissions
    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    
    // Board permissions
    Permissions.CREATE_BOARD,
    Permissions.EDIT_BOARD,
    
    // Epic permissions
    Permissions.CREATE_EPIC,
    Permissions.EDIT_EPIC,
    
    // Task permissions
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.COMMENT_ON_TASK,
    Permissions.ASSIGN_TASK,
    Permissions.CREATE_SUBTASK,
    
    // Sprint permissions
    Permissions.CREATE_SPRINT,
    Permissions.EDIT_SPRINT,
    
    // Basic permission
    Permissions.VIEW_ONLY,
  ],
  
  // Team level roles
  TEAM_LEAD: [
    // Workspace permissions
    Permissions.CREATE_WORKSPACE,
    Permissions.EDIT_WORKSPACE,
    
    // Member management
    Permissions.ADD_MEMBER,
    
    // Project permissions
    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    Permissions.MANAGE_PROJECT,
    
    // Board permissions
    Permissions.CREATE_BOARD,
    Permissions.EDIT_BOARD,
    Permissions.CHANGE_BOARD_TYPE,
    
    // Epic permissions
    Permissions.CREATE_EPIC,
    Permissions.EDIT_EPIC,
    
    // Task permissions
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.DELETE_TASK,
    Permissions.COMMENT_ON_TASK,
    Permissions.ASSIGN_TASK,
    Permissions.CREATE_SUBTASK,
    
    // Sprint permissions
    Permissions.CREATE_SPRINT,
    Permissions.EDIT_SPRINT,
    Permissions.START_SPRINT,
    Permissions.COMPLETE_SPRINT,
    
    // Basic permission
    Permissions.VIEW_ONLY,
  ],
  
  TEAM_ADMIN: [
    // Project permissions
    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    
    // Board permissions
    Permissions.CREATE_BOARD,
    Permissions.EDIT_BOARD,
    
    // Epic permissions
    Permissions.CREATE_EPIC,
    Permissions.EDIT_EPIC,
    
    // Task permissions
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.COMMENT_ON_TASK,
    Permissions.ASSIGN_TASK,
    Permissions.CREATE_SUBTASK,
    
    // Sprint permissions
    Permissions.CREATE_SPRINT,
    Permissions.EDIT_SPRINT,
    
    // Basic permission
    Permissions.VIEW_ONLY,
  ],
  
  // Workspace/Project level roles (keeping backward compatibility)
  OWNER: [
    // Workspace permissions
    Permissions.CREATE_WORKSPACE,
    Permissions.EDIT_WORKSPACE,
    Permissions.DELETE_WORKSPACE,
    Permissions.MANAGE_WORKSPACE_SETTINGS,

    // Member management
    Permissions.ADD_MEMBER,
    Permissions.CHANGE_MEMBER_ROLE,
    Permissions.REMOVE_MEMBER,
    Permissions.INVITE_MEMBERS,

    // Team permissions (adding these)
    Permissions.CREATE_TEAM,
    Permissions.DELETE_TEAM,
    Permissions.EDIT_TEAM,
    Permissions.MANAGE_TEAM_SETTINGS,

    // Project permissions
    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    Permissions.DELETE_PROJECT,
    Permissions.MANAGE_PROJECT,

    // Board permissions
    Permissions.CREATE_BOARD,
    Permissions.EDIT_BOARD,
    Permissions.DELETE_BOARD,
    Permissions.CHANGE_BOARD_TYPE,
    
    // Epic permissions
    Permissions.CREATE_EPIC,
    Permissions.EDIT_EPIC,
    Permissions.DELETE_EPIC,

    // Task permissions
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.DELETE_TASK,
    Permissions.COMMENT_ON_TASK,
    Permissions.ASSIGN_TASK,
    Permissions.CREATE_SUBTASK,
    
    Permissions.CREATE_SPRINT,
    Permissions.EDIT_SPRINT,
    Permissions.DELETE_SPRINT,
    Permissions.START_SPRINT,
    Permissions.COMPLETE_SPRINT,

    Permissions.VIEW_ONLY,
  ],
  
  ADMIN: [
    Permissions.ADD_MEMBER,
    Permissions.INVITE_MEMBERS,  // Adding this permission for Admins
    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    Permissions.DELETE_PROJECT,
    Permissions.MANAGE_PROJECT,
    
    Permissions.CREATE_BOARD,
    Permissions.EDIT_BOARD,
    Permissions.CHANGE_BOARD_TYPE,
    
    Permissions.CREATE_EPIC,
    Permissions.EDIT_EPIC,
    
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.DELETE_TASK,
    Permissions.COMMENT_ON_TASK,
    Permissions.ASSIGN_TASK,
    Permissions.CREATE_SUBTASK,
    
    Permissions.CREATE_SPRINT,
    Permissions.EDIT_SPRINT,
    Permissions.START_SPRINT,
    Permissions.COMPLETE_SPRINT,
    
    Permissions.MANAGE_WORKSPACE_SETTINGS,
    Permissions.VIEW_ONLY,
  ],
  
  MEMBER: [
    Permissions.VIEW_ONLY,
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.COMMENT_ON_TASK,
    Permissions.CREATE_SUBTASK,
  ],
  
  // General roles
  GUEST: [
    Permissions.VIEW_ONLY,
    Permissions.COMMENT_ON_TASK,
  ],
};
