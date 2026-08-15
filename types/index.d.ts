/* GENERATED from schemas/**. Do not edit by hand — run `npm run types`.
 *
 * JSON Schema is the source of truth. These types are derived from it.
 * Defining a shape a second time (in Zod, in an interface, anywhere) reintroduces the
 * drift this generation exists to prevent.
 */

/** A reusable, versioned unit of capability. THE REASON SHARED CREDIT WORKS: two items in different tools referencing ONE block read ONE record, so a facility doing that work is credited once — not once per checklist they happened to open. Journeys, hazard packs, department views and phase views are ORDERED SELECTIONS of the same blocks. */
export type CapabilityBlock = {
    id: string;
    version: string;
    title: unknown;
    description: unknown;
    /** Item identifiers reading this block. COMPUTED, never authored — an authored list goes stale the moment an item is added. */
    referencedBy?: string[];
  };

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

/** The state machine, expressed so both sides implement ONE definition. canTransition is the ONLY way to move; there is no direct state assignment. */
export type Lifecycle = {
    /** from → the states it may legally reach. A transition not listed here does not exist. */
    transitions: {
      draft?: "in-review"[];
      in-review?: "approved" | "returned"[];
      returned?: "in-review"[];
      approved?: "deprecated"[];
      deprecated?: unknown[];
    };
    /** nextStates(deprecated) returns []. A deprecated version is immutable. */
    terminal: "deprecated"[];
    /** Consumers read APPROVED only. Drafts, returned drafts and deprecated versions are invisible to them. */
    consumerVisible: "approved"[];
    /** An approved version is never edited — only superseded. A deprecated one is frozen. */
    immutableStates?: "approved" | "deprecated"[];
  };

/** A checklist, form, template, test or quick reference, with its items. The unit of AUTHORING and of the editorial lifecycle — items are the unit progress attaches to, but a tool is what a person reviews, approves and withdraws. */
export type Tool = {
    id: string;
    /** Semantic. A local adaptation appends a suffix — 1.2.0-facility-x.1 — so its lineage is visible in the version itself. */
    version: string;
    title: unknown;
    purpose: unknown;
    /** A = controlling or official. B = programme material requiring owner confirmation. C = derived implementation content, not automatically normative. D = product hypothesis. ADAPTING CLASS A CONTENT PRODUCES CLASS C — a facility that edits official guidance and keeps the class A label has created content claiming an authority it no longer has. */
    authorityClass: "A" | "B" | "C" | "D";
    /** An `unclassified` tool CANNOT BE EXECUTED. Defaulting is not a fix — the classification is a judgement about what the tool is for. */
    classification: "checklist" | "form" | "template" | "test" | "quick-reference" | "mixed" | "unclassified";
    /** What a user mostly does with it — binary confirmation, narrative finding, measurement, referral. */
    dominantResponseType?: string | null;
    specialistReferralRoute?: string | null;
    /** Drives OFFLINE EXPIRY BEHAVIOUR. `general` warns and continues past expiry; `high` STOPS until connectivity confirms it has not been withdrawn. The staleness a hospital tolerates for a supply checklist is not what it tolerates for an evacuation instrument. Enforcement mechanism E14. */
    riskTier?: "general" | "high";
    specialistReviewRequired?: boolean;
    specialistReviewSignedBy?: string | null;
    /** Consumers read APPROVED only. A published version is NEVER edited — a change creates a new version and preserves the prior. */
    lifecycleState: "draft" | "in-review" | "returned" | "approved" | "deprecated";
    /** Every publication surface has a withdrawal path. The prior attempt had two lifecycles, one of which had no terminal state: content could be deprecated editorially and remain published indefinitely. */
    withdrawnAt?: string | null;
    provenance: unknown;
    /** Set on a local adaptation. Retains the source's identity and history — adaptation must not destroy provenance. */
    parent?: {
      toolId: string;
      version: string;
      authorityClass: "A" | "B" | "C" | "D";
      changeSummary?: string;
      adaptedBy?: string;
      adaptedAt?: string;
    } | null;
    items: unknown[];
    /** Who touched this version. REVIEWER SEPARATION COVERS ANYBODY WHO EDITED IT, not merely its recorded author — the stricter reading, and the correct one. An author who hands a draft to a colleague to 'just fix the wording' has not created an independent reviewer. */
    editorial?: {
      /** Every person who modified this version. The approver must appear in NEITHER this list nor as the author. */
      editors: string[];
      submittedBy?: string | null;
      reviewedBy?: string | null;
      reviewedAt?: string | null;
      returnReason?: string | null;
    };
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
  | "request-rate-limited"
  | "illegal-lifecycle-transition"
  | "deprecated-versions-are-immutable"
  | "unknown-lifecycle-state"
  | "withdrawn-content-may-not-be-executed"
  | "cached-content-expired"
  | "local-adaptation-may-not-claim-parent-authority";

export interface Refusal {
  refusal: RefusalId;
  message: string;
  detail?: Record<string, unknown>;
}
