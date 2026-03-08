import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (code: string) => void;
  active: boolean;
}

const QRScanner = ({ onScan, active }: QRScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastScanRef = useRef<string>("");
  const cooldownRef = useRef(false);

  useEffect(() => {
    if (!active) {
      if (scannerRef.current && started) {
        scannerRef.current.stop().catch(() => {});
        setStarted(false);
      }
      return;
    }

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (cooldownRef.current) return;
          if (decodedText === lastScanRef.current) return;
          lastScanRef.current = decodedText;
          cooldownRef.current = true;
          onScan(decodedText);
          setTimeout(() => {
            cooldownRef.current = false;
            lastScanRef.current = "";
          }, 2000);
        },
        () => {}
      )
      .then(() => {
        setStarted(true);
        setError(null);
      })
      .catch((err) => {
        setError("Camera access denied. Please allow camera permissions or enter QR code manually.");
      });

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, [active, onScan]);

  if (!active) return null;

  return (
    <div className="space-y-2">
      <div
        id="qr-reader"
        className="rounded-lg overflow-hidden border border-border bg-muted/20"
        style={{ minHeight: 280 }}
      />
      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
    </div>
  );
};

export default QRScanner;
