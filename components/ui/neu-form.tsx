import Link from "next/link";
import { cn } from "@/lib/utils";

type NeuLabelProps = {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
};

export function NeuLabel({
  htmlFor,
  children,
  required,
  className,
}: NeuLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-2 block text-xs font-semibold uppercase tracking-wider text-neu-text/70",
        className,
      )}
    >
      {children}
      {required && <span className="ml-0.5 text-neu-accent-3">*</span>}
    </label>
  );
}

type NeuInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function NeuInput({ className, ...props }: NeuInputProps) {
  return (
    <input
      className={cn(
        "neu-inset-md neu-focus w-full rounded-[1.25rem] px-4 py-3 text-sm text-neu-text outline-none placeholder:text-neu-muted/60",
        className,
      )}
      {...props}
    />
  );
}

type NeuTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function NeuTextarea({ className, ...props }: NeuTextareaProps) {
  return (
    <textarea
      className={cn(
        "neu-inset-md neu-focus w-full resize-none rounded-[1.25rem] px-4 py-3 text-sm text-neu-text outline-none placeholder:text-neu-muted/60",
        className,
      )}
      {...props}
    />
  );
}

type NeuSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function NeuSelect({ className, children, ...props }: NeuSelectProps) {
  return (
    <select
      className={cn(
        "neu-inset-md neu-tap w-full appearance-none rounded-[1.25rem] px-4 py-3 text-sm text-neu-text outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { MotionButton as NeuButton } from "@/components/ui/motion-primitives";

type NeuLinkButtonProps = React.ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
};

export function NeuLinkButton({
  variant = "secondary",
  className,
  children,
  ...props
}: NeuLinkButtonProps) {
  return (
    <Link
      className={cn(
        "px-5 py-2.5 text-sm font-semibold outline-none transition-transform active:scale-[0.98]",
        variant === "primary" && "akno-btn-primary",
        variant === "secondary" && "akno-btn-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function NeuFieldGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}

export function NeuSectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="neu-inset-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-neu-text/60">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-neu-text">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-neu-muted">{description}</p>
        )}
      </div>
    </div>
  );
}
