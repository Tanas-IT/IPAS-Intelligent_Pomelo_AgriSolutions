import { useCallback } from "react";

type ExportFunc = (...args: any[]) => Promise<{ blob: Blob; filename: string }>;

const useExportFile = (exportFunc: ExportFunc) => {
  const triggerExport = useCallback(
    async (...args: any[]) => {
      try {
        const { blob, filename } = await exportFunc(...args);

        const url = URL.createObjectURL(blob);
        const link = Object.assign(document.createElement("a"), {
          href: url,
          download: filename,
        });

        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Export failed:", error);
      }
    },
    [exportFunc],
  );

  return triggerExport;
};

export default useExportFile;
