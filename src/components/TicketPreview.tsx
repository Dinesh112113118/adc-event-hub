import { QRCodeSVG } from "qrcode.react";
import { TicketTemplate, Registration } from "@/types/event";

interface TicketPreviewProps {
  template: TicketTemplate;
  registration: Registration;
  compact?: boolean;
}

const TicketPreview = ({ template, registration, compact = false }: TicketPreviewProps) => {
  const size = compact ? 100 : 160;

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden bg-card ${compact ? "p-3" : "p-6"}`}
      style={{ borderColor: template.primaryColor + "40" }}
    >
      {/* Header */}
      <div
        className={`-mx-6 -mt-6 px-6 ${compact ? "-mx-3 -mt-3 px-3 py-3 mb-3" : "py-5 mb-5"}`}
        style={{ background: `linear-gradient(135deg, ${template.primaryColor}, ${template.primaryColor}cc)` }}
      >
        <p className={`text-primary-foreground/80 ${compact ? "text-[10px]" : "text-xs"}`}>
          {template.tagline}
        </p>
        <h3 className={`font-bold text-primary-foreground ${compact ? "text-sm" : "text-xl"}`}>
          {template.eventName}
        </h3>
      </div>

      <div className={`flex ${compact ? "gap-3" : "gap-5"} items-start`}>
        {/* Details */}
        <div className="flex-1 space-y-2">
          <div>
            <p className={`font-bold ${compact ? "text-xs" : "text-base"}`}>{registration.name}</p>
            <p className={`text-muted-foreground ${compact ? "text-[10px]" : "text-xs"}`}>
              {registration.email}
            </p>
          </div>

          {(template.showDepartment || template.showYear) && (
            <div className={`flex gap-2 ${compact ? "text-[10px]" : "text-xs"}`}>
              {template.showDepartment && registration.department && (
                <span className="rounded-full bg-muted px-2 py-0.5">{registration.department}</span>
              )}
              {template.showYear && registration.year && (
                <span className="rounded-full bg-muted px-2 py-0.5">{registration.year} Year</span>
              )}
            </div>
          )}

          <div className={`space-y-0.5 ${compact ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
            <p>📅 {template.date}</p>
            <p>⏰ {template.time}</p>
            <p>📍 {template.venue}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className="rounded-lg bg-foreground p-2">
            <QRCodeSVG
              value={registration.qrCode}
              size={size}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>
          <p className={`font-mono text-muted-foreground ${compact ? "text-[8px]" : "text-[10px]"}`}>
            {registration.qrCode}
          </p>
        </div>
      </div>

      {/* Footer */}
      {!compact && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">{template.footerText}</p>
        </div>
      )}
    </div>
  );
};

export default TicketPreview;
