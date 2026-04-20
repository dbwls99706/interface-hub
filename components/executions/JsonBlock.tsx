export const JsonBlock = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        데이터가 없습니다.
      </div>
    );
  }
  let pretty: string;
  try {
    pretty = JSON.stringify(value, null, 2);
  } catch {
    pretty = String(value);
  }
  return (
    <pre className="text-xs overflow-auto bg-muted p-3 rounded max-h-[480px] font-mono">
      {pretty}
    </pre>
  );
};
