import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  className?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, className, children }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
