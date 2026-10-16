import Image from "next/image";

import chainIcon from "@/app/icon.png";
import { cn } from "@/lib/utils";

function ChainMark({ className }: { className?: string }) {
  return (
    <Image
      src={chainIcon}
      alt=""
      aria-hidden="true"
      width={24}
      height={24}
      sizes="24px"
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

export { ChainMark };
