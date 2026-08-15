/* GENERATED from schemas/**. Do not edit by hand — run `npm run types`.
 *
 * JSON Schema is the source of truth. These types are derived from it.
 * Defining a shape a second time (in Zod, in an interface, anywhere) reintroduces the
 * drift this generation exists to prevent.
 */

/** No user-visible string is ever a literal. Every one is a locale key. */
export type LocalisedText = {
    key: string;
    /** Development label only. Its presence in a published bundle is reported by the manifest as a provisional string awaiting native-language review. */
    fallback?: string;
  };

export type Provenance = {
    sourceDocument: string;
    /** Page or section. Provenance is PER ITEM, not per document. */
    sourceLocation: string;
    issuingBody: string;
    publicationDate: string;
    reviewStatus: "unreviewed" | "expert-reviewed" | "approved-for-pilot" | "deprecated";
    /** HAVING A FILE DOES NOT IMPLY PERMISSION TO PUBLISH IT. Publication requires `confirmed` or `not-required`; `pending` may be ingested as draft but never published. */
    reproductionPermission: "confirmed" | "pending" | "refused" | "not-required";
    permissionEvidence?: string | null;
  };

/** A single capability requirement inside a tool. THE UNIT PROGRESS ATTACHES TO. Progress attaches to a versioned capability block, never to a quest, chapter or route — two contexts reusing a block share credit because they read one record. */
export type Item = {
    /** Stable identifier. Never a title — titles change. */
    id: string;
    /** The tool this item belongs to. */
    toolId: string;
    /** Inherited from the tool. An item is not independently versioned. */
    version: string;
    title: LocalisedText;
    /** Plain-language statement of what this item is for. */
    purpose: LocalisedText;
    /** Where the content's authority comes from, and therefore what may be claimed about it. A = controlling or official. B = programme material requiring owner confirmation. C = derived implementation content, not automatically normative. D = product hypothesis or prototype. */
    authorityClass: "A" | "B" | "C" | "D";
    /** What the item is FOR. `unclassified` is a real member, not an absence — and an unclassified item CANNOT BE EXECUTED. Defaulting a classification is not a fix; it is a judgement about what the tool is for, and guessing produces a tool that executes incorrectly rather than one that refuses honestly. */
    classification: "checklist" | "form" | "template" | "test" | "quick-reference" | "mixed" | "unclassified";
    /** High-risk technical, clinical, structural, fire or hazardous-material content. When true the item is readable and clearly labelled but CANNOT BE EXECUTED until a qualified reviewer signs. */
    specialistReviewRequired?: boolean;
    /** Null while review is outstanding. Execution is refused with `specialist-review-required-before-execution`. */
    specialistReviewSignedBy?: string | null;
    /** Consumers read APPROVED versions only. A published version is never edited — a change creates a new version and preserves the prior one. */
    lifecycleState: "draft" | "in-review" | "returned" | "approved" | "deprecated";
    /** Minimum metadata. An item without complete provenance is refused with `insufficient-provenance`. */
    provenance: Provenance;
    /** Orthogonal filter axes — deliberately NOT a hierarchy. The same item legitimately belongs to several, and forcing one primary classification loses that. */
    applicability?: {
      capabilityRoute?: "space" | "staff" | "stuff" | "systems" | "strategies"[];
      phase?: "preparedness" | "alert" | "activation" | "operations" | "de-escalation" | "recovery" | "learning"[];
      hazard?: string[];
      function?: string[];
      entity?: "facility" | "network" | "system"[];
      service?: string[];
    };
    requiredRoles?: string[];
    prerequisites?: string[];
    /** What counts as done. Required — an item whose completion cannot be described cannot be evidenced. */
    evidenceRule: LocalisedText;
    /** The reusable versioned block this item reads. TWO CONTEXTS REFERENCING ONE BLOCK SHARE CREDIT. Skipping this produces parallel checklists that each earn separately, so a facility doing one piece of work is credited once, twice, or not at all depending which checklist they opened. */
    capabilityBlockRef: string;
    /** Content ages. Expiry is surfaced, never silently enforced — an expired item stays readable and is labelled. */
    reviewDate?: string | null;
    /** Locales this item is translated into. Coverage is computed and reported, never discovered by a user. */
    localeCoverage?: string[];
  };

/** Every refusal identifier in the ecosystem. A refusal not in this union does not exist. */
export type RefusalId =
  | "session-expired"
  | "session-invalid"
  | "participation-requires-facility-seat"
  | "unclassified-tool-may-not-be-executed"
  | "specialist-review-required-before-execution"
  | "published-version-is-immutable"
  | "reviewer-may-not-approve-own-version"
  | "insufficient-provenance"
  | "reproduction-permission-not-confirmed"
  | "reviewer-may-not-accept-own-evidence"
  | "reviewer-may-not-accept-own-artifact"
  | "education-may-not-advance-capability-state"
  | "exercise-may-not-write-evidence"
  | "unapproved-content-may-not-earn-progress"
  | "platform-admin-may-not-enter-facility"
  | "observation-record-has-no-review-state"
  | "facility-not-resolved"
  | "facility-approval-pending"
  | "external-subject-not-stable"
  | "enrolment-rate-limited"
  | "request-rate-limited";

export interface Refusal {
  refusal: RefusalId;
  message: string;
  detail?: Record<string, unknown>;
}
