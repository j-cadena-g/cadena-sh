import type { ComponentType, SVGProps } from "react";
import {
  ClipboardCheck,
  type LucideIcon,
  Network,
  Route,
  ShieldCheck,
} from "lucide-react";

import { GithubLight } from "@/components/ui/svgs/github-light";
import { Linkedin } from "@/components/ui/svgs/linkedin";
import { X } from "@/components/ui/svgs/x";

export type ProofPoint = {
  id: string;
  value: string;
  label: string;
  description: string;
  Icon: LucideIcon;
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
    id: "core-network",
    value: "Architecture",
    label: "Enterprise networks",
    description: "Core and datacenter design built to fail over cleanly.",
    Icon: Network,
  },
  {
    id: "ngfw",
    value: "Palo Alto",
    label: "Next-generation firewalls",
    description: "App-ID, User-ID, GlobalProtect, and decryption.",
    Icon: ShieldCheck,
  },
  {
    id: "sd-wan",
    value: "SD-WAN",
    label: "Multi-site connectivity",
    description: "Better latency, stronger resilience, cleaner failover.",
    Icon: Route,
  },
  {
    id: "nist-csf",
    value: "NIST CSF 2.0",
    label: "Security governance",
    description: "Controls and priorities organized around risk.",
    Icon: ClipboardCheck,
  },
];

export const impactItems: ImpactItem[] = [
  {
    id: "core-datacenter",
    label: "Core network and datacenter",
    title: "Architecture for the network everything else depends on.",
    description:
      "Enterprise core and datacenter network architecture, with SD-WAN between sites, built so a failed link or switch is a non-event instead of an outage.",
  },
  {
    id: "netsec-ops",
    label: "Network security",
    title: "Palo Alto firewall policy in production.",
    description:
      "App-ID and User-ID policy design, segmentation, SSL decryption, IDS/IPS, GlobalProtect remote access, URL filtering, and the ongoing tuning that keeps controls useful after rollout.",
  },
  {
    id: "security-governance",
    label: "Security governance",
    title: "Security work framed by NIST CSF 2.0.",
    description:
      "Organizing controls and gaps across Govern, Identify, Protect, Detect, Respond, and Recover, so effort follows risk instead of the loudest alert.",
  },
  {
    id: "identity-zero-trust",
    label: "Identity and Zero Trust",
    title: "Access decided by identity, not network location.",
    description:
      "Active Directory, Microsoft Entra ID, and Google identity, SAML 2.0 and OAuth integrations with enterprise apps, and identity-aware policy that narrows who can reach what.",
  },
  {
    id: "systems-resilience",
    label: "Systems resilience",
    title: "Build systems that recover cleanly and stay usable.",
    description:
      "VMware vSphere virtualization, Veeam Backup & Replication, and storage architecture across SAN, NAS, and distributed S3 object storage, planned so recovery is tested rather than assumed.",
  },
];

export const capabilityGroups: CapabilityGroup[] = [
  {
    id: "networks",
    title: "Networks",
    items: [
      "Palo Alto NGFW",
      "Network architecture",
      "Datacenter architecture",
      "SD-WAN",
      "IPsec VPN",
      "BGP/OSPF",
      "IPv4/IPv6",
    ],
  },
  {
    id: "security",
    title: "Security",
    items: [
      "NIST CSF 2.0",
      "Zero Trust",
      "App-ID",
      "User-ID",
      "GlobalProtect",
      "IDS/IPS",
      "SSL decryption",
    ],
  },
  {
    id: "identity",
    title: "Identity",
    items: [
      "Active Directory",
      "Microsoft Entra ID",
      "Google Workspace",
      "SAML 2.0",
      "OAuth 2.0",
    ],
  },
  {
    id: "systems",
    title: "Systems",
    items: ["VMware vSphere", "vCenter", "Windows Server", "Linux"],
  },
  {
    id: "storage-backup",
    title: "Storage and backup",
    items: [
      "Veeam Backup & Replication",
      "SAN",
      "NAS",
      "Distributed S3 storage",
      "Storage architecture",
    ],
  },
  {
    id: "cloud",
    title: "Cloud",
    items: ["Microsoft Azure", "Google Cloud", "AWS", "Cloudflare"],
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
