import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PlayIcon, PauseIcon, StopIcon } from "lucide-react";
import { formatTimeFromSeconds } from "@/lib/time-utils";
import useTimeEntryMutations from "@/hooks/api/use-time-entry-mutations";
import { CreateTimeEntryType } from "@/types/time-tracking.type";
import { useToast } from "@/components/ui/use-toast";

interface TimerProps {
  workspaceId: string;
  projectId?: string;
  taskId?: string;
}

const Timer = ({ workspaceId, projectId, taskId }: TimerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const startTimeRef = useRef<Date | null>(null);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { createTimeEntry } = useTimeEntryMutations(workspaceId);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Title Required",
        description: "Please enter a title for your time entry.",
      });
      return;
    }

    setIsRunning(true);
    startTimeRef.current = new Date();
    
    timerRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
        setElapsedTime(diff);
      }
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  const stopTimer = async () => {
    if (!startTimeRef.current) return;

    pauseTimer();

    const timeEntry: CreateTimeEntryType = {
      title,
      description: description || undefined,
      startTime: startTimeRef.current.toISOString(),
      endTime: new Date().toISOString(),
      duration: elapsedTime,
      isRunning: false,
      workspaceId,
      projectId,
      taskId,
    };

    try {
      await createTimeEntry.mutateAsync(timeEntry);
      
      // Reset timer
      setElapsedTime(0);
      setTitle("");
      setDescription("");
      startTimeRef.current = null;
      
      toast({
        title: "Time entry saved",
        description: "Your time entry has been successfully saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving time entry",
        description: "There was a problem saving your time entry.",
      });
    }
  };

  return (
    <Card className="p-4 mb-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Input
            type="text"
            placeholder="What are you working on?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isRunning}
            className="text-base"
          />
          <Input
            type="text"
            placeholder="Add description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isRunning}
            className="text-sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold font-mono">
            {formatTimeFromSeconds(elapsedTime)}
          </div>
          
          <div className="flex gap-2">
            {!isRunning ? (
              <Button onClick={startTimer} variant="default" size="sm">
                <PlayIcon className="h-4 w-4 mr-1" />
                Start
              </Button>
            ) : (
              <>
                <Button onClick={pauseTimer} variant="outline" size="sm">
                  <PauseIcon className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button onClick={stopTimer} variant="default" size="sm">
                  <StopIcon className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Timer;