import { ItemStatus, PriorityLevel, SystemName } from "@prisma/client";

export const SYSTEM_DEFINITIONS = [
  { name: SystemName.MARKETING, label: "Marketing", slug: "marketing" },
  { name: SystemName.SALES, label: "Sales", slug: "sales" },
  { name: SystemName.PARTNERSHIPS, label: "Partnerships", slug: "partnerships" },
  { name: SystemName.OPERATIONS, label: "Operations", slug: "operations" },
  { name: SystemName.CUSTOMER_SERVICE, label: "Customer Success", slug: "customer-service" },
  { name: SystemName.FINANCE, label: "Finance", slug: "finance" },
  { name: SystemName.PEOPLE, label: "People", slug: "people" },
  { name: SystemName.LEADERSHIP, label: "Leadership", slug: "leadership" },
] as const;

export const STATUS_OPTIONS = [
  { value: ItemStatus.NOT_STARTED, label: "Not Started" },
  { value: ItemStatus.IN_PROGRESS, label: "In Progress" },
  { value: ItemStatus.BLOCKED, label: "Blocked" },
  { value: ItemStatus.COMPLETE, label: "Complete" },
] as const;

export const PRIORITY_OPTIONS = [
  { value: PriorityLevel.LOW, label: "Low" },
  { value: PriorityLevel.MEDIUM, label: "Medium" },
  { value: PriorityLevel.HIGH, label: "High" },
  { value: PriorityLevel.CRITICAL, label: "Critical" },
] as const;

export type SystemSlug = (typeof SYSTEM_DEFINITIONS)[number]["slug"];

export function getSystemBySlug(systemSlug: string) {
  return SYSTEM_DEFINITIONS.find((system) => system.slug === systemSlug);
}

export function getSystemByName(name: SystemName) {
  return SYSTEM_DEFINITIONS.find((system) => system.name === name);
}
