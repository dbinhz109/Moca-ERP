"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDeleteProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  className?: string;
  ariaLabel?: string;
}

/** Nút thùng rác + hộp thoại xác nhận. Tự chặn điều hướng khi đặt trên thẻ Link. */
export function ConfirmDelete({
  title,
  description,
  confirmLabel = "Xoá",
  onConfirm,
  className,
  ariaLabel = "Xoá",
}: ConfirmDeleteProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white/90 text-text3 backdrop-blur transition-colors hover:border-rag-red/40 hover:bg-rag-red/10 hover:text-rag-red",
          className
        )}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Huỷ
            </Button>
            <Button variant="danger" onClick={handleConfirm} disabled={pending}>
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
