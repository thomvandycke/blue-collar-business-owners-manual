"use client";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button variant="secondary" type="button" onClick={() => window.print()}>
      Print
    </Button>
  );
}
