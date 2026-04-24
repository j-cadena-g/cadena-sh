import type { ComponentType, SVGProps } from "react";

import { GithubLight } from "@/components/ui/svgs/github-light";
import { Linkedin } from "@/components/ui/svgs/linkedin";
import { X } from "@/components/ui/svgs/x";

export type ProofPoint = {
  id: string;
  value: string;
  label: string;
  description: string;
};

export type ImpactItem = {
  id: string;
  label: string;
  title: string;
  description: string;
};

export type CapabilityGroup = {
  id: string;
  title: string;
  items: string[];
};

export type ProfileLink = {
  id: string;
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const proofPoints: ProofPoint[] = [
  {
    id: "multi-site",
    value: "Multi-site",
    label: "Distributed networks",
    description: "Secure connectivity and policy across production sites.",
  },
  {
    id: "zero-trust",
    value: "Zero Trust",
    label: "Identity-based access",
    description: "Remote access with less public exposure.",
  },
  {
    id: "sd-wan",
    value: "SD-WAN",
    label: "Network performance",
    description: "Better latency, stronger resilience, cleaner failover.",
  },
  {
    id: "edge-serverless",
    value: "Edge APIs",
    label: "Platforms and APIs",
    description: "Small APIs, edge logic, and deployment workflows.",
  },
];

export const impactItems: ImpactItem[] = [
  {
    id: "netsec-ops",
    label: "Network security operations",
    title: "Firewall, access, and policy work in production.",
    description:
      "Policy design, segmentation, remote access, VPN, URL filtering, and the ongoing tuning that keeps controls useful after rollout.",
  },
  {
    id: "global-connectivity",
    label: "Global connectivity",
    title: "Distributed network performance across sites.",
    description:
      "WAN and inter-site work focused on latency, resilience, and clean failover between paths.",
  },
  {
    id: "zero-trust-identity",
    label: "Zero Trust and identity",
    title: "Reduce reliance on broad internal trust.",
    description:
      "Identity-aware policy and tighter remote-access patterns shrink exposed internal surfaces and narrow who can reach what.",
  },
  {
    id: "systems-resilience",
    label: "Systems resilience",
    title: "Build systems that recover cleanly and stay usable.",
    description:
      "Backup hardening, observability, virtualization, and recovery planning that keep a system running when something breaks.",
  },
];

export const capabilityGroups: CapabilityGroup[] = [
  {
    id: "networks",
    title: "Networks",
    items: ["Palo Alto NGFW", "SD-WAN", "IPsec VPN", "IPv4/IPv6", "BGP/OSPF"],
  },
  {
    id: "systems",
    title: "Systems",
    items: ["Proxmox", "ZFS", "TrueNAS", "Windows Server", "Linux"],
  },
  {
    id: "security",
    title: "Security",
    items: ["Zero Trust", "IDS/IPS", "SSL decryption", "User-aware policy"],
  },
  {
    id: "cloud-apis",
    title: "Cloud and APIs",
    items: ["Cloudflare Workers", "D1/KV/DO", "Vercel", "Serverless APIs"],
  },
];

export const profileLinks: ProfileLink[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/j-cadena-g",
    Icon: Linkedin,
  },
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/j-cadena-g",
    Icon: GithubLight,
  },
  {
    id: "x",
    label: "X",
    href: "https://x.com/j_cadena_g",
    Icon: X,
  },
];
