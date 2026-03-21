import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  className?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, className, children }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      {children && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{children}</div>}
    </div>
  );
}
