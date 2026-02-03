import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Cog, Wrench } from "lucide-react";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { ProcessType } from "@/types/management-system";
import { toast } from "sonner";

interface CreateProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROCESS_TYPES: { value: ProcessType; label: string; icon: React.ElementType; description: string }[] = [
  { 
    value: "management", 
    label: "Management", 
    icon: Settings,
    description: "Strategic and governance processes"
  },
  { 
    value: "operational", 
    label: "Operational", 
    icon: Cog,
    description: "Core value-creating processes"
  },
  { 
    value: "support", 
    label: "Support", 
    icon: Wrench,
    description: "Supporting and enabling processes"
  },
];

export function CreateProcessDialog({ open, onOpenChange }: CreateProcessDialogProps) {
  const navigate = useNavigate();
  const { createProcess, generateProcessCode } = useManagementSystem();
  
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<ProcessType>("operational");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate code when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !code) {
      setCode(generateProcessCode());
    }
    if (!newOpen) {
      // Reset form on close
      setName("");
      setCode("");
      setType("operational");
    }
    onOpenChange(newOpen);
  };

  const handleCreate = () => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();

    if (!trimmedName) {
      toast.error("Process name is required");
      return;
    }

    if (!trimmedCode) {
      toast.error("Process code is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const newProcess = createProcess({
        code: trimmedCode,
        name: trimmedName,
        type,
        purpose: "Purpose to be defined",
        inputs: ["Input to be defined"],
        outputs: ["Output to be defined"],
        activities: [],
        regulations: [],
        status: "draft",
        standard: "ISO_9001",
      });

      toast.success("Process created");
      onOpenChange(false);
      
      // Navigate to the newly created process detail view
      navigate(`/processes/${newProcess.id}`);
    } catch (error) {
      toast.error("Failed to create process");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Create New Process</DialogTitle>
          <DialogDescription>
            Enter basic information. You can configure all other details after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Process Name */}
          <div className="space-y-2">
            <Label htmlFor="process-name">Process Name *</Label>
            <Input
              id="process-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Customer Order Management"
              autoFocus
            />
          </div>

          {/* Process Code */}
          <div className="space-y-2">
            <Label htmlFor="process-code">Reference Code *</Label>
            <Input
              id="process-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., PROC-001"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Auto-generated, but you can modify it.
            </p>
          </div>

          {/* Process Type */}
          <div className="space-y-2">
            <Label>Process Type *</Label>
            <Select value={type} onValueChange={(value: ProcessType) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROCESS_TYPES.map((pt) => {
                  const Icon = pt.icon;
                  return (
                    <SelectItem key={pt.value} value={pt.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{pt.label}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          — {pt.description}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Process"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
