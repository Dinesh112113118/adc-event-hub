import { TicketTemplate } from "@/types/event";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface TicketEditorProps {
  template: TicketTemplate;
  onChange: (template: TicketTemplate) => void;
}

const TicketEditor = ({ template, onChange }: TicketEditorProps) => {
  const update = (key: keyof TicketTemplate, value: string | boolean) => {
    onChange({ ...template, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tagline</Label>
        <Input
          value={template.tagline}
          onChange={(e) => update("tagline", e.target.value)}
          placeholder="e.g. Aliet Techpreneur Club presents"
        />
      </div>

      <div className="space-y-2">
        <Label>Event Name (on ticket)</Label>
        <Input
          value={template.eventName}
          onChange={(e) => update("eventName", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            value={template.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Time</Label>
          <Input
            value={template.time}
            onChange={(e) => update("time", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Venue</Label>
        <Input
          value={template.venue}
          onChange={(e) => update("venue", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Organizer Name</Label>
        <Input
          value={template.organizerName}
          onChange={(e) => update("organizerName", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Footer Text</Label>
        <Textarea
          value={template.footerText}
          onChange={(e) => update("footerText", e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Primary Color</Label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={template.primaryColor}
            onChange={(e) => update("primaryColor", e.target.value)}
            className="h-9 w-12 rounded cursor-pointer border border-border"
          />
          <Input
            value={template.primaryColor}
            onChange={(e) => update("primaryColor", e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Show Department</Label>
          <Switch
            checked={template.showDepartment}
            onCheckedChange={(v) => update("showDepartment", v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Show Year</Label>
          <Switch
            checked={template.showYear}
            onCheckedChange={(v) => update("showYear", v)}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketEditor;
