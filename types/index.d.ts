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
      capabilityRoute?: ("space" | "staff" | "stuff" | "systems" | "strategies")[];
      phase?: ("preparedness" | "alert" | "activation" | "operations" | "de-escalation" | "recovery" | "learning")[];
      hazard?: string[];
      function?: string[];
      entity?: ("facility" | "network" | "system")[];
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
      "in-review"?: ("approved" | "returned")[];
      returned?: "in-review"[];
      approved?: "deprecated"[];
      deprecated?: unknown[];
    };
    /** nextStates(deprecated) returns []. A deprecated version is immutable. */
    terminal: "deprecated"[];
    /** Consumers read APPROVED only. Drafts, returned drafts and deprecated versions are invisible to them. */
    consumerVisible: "approved"[];
    /** An approved version is never edited — only superseded. A deprecated one is frozen. */
    immutableStates?: ("approved" | "deprecated")[];
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
    /** Set when this content is adapted from an EXTERNAL SOURCE DOCUMENT rather than from another catalogue tool. `parent` cannot express this — it requires a toolId — so without this block the adaptation rule is unfireable for every ingested batch. DEC-025. */
    adaptedFrom?: {
      sourceDocument: string;
      issuingBody: string;
      /** The authority class of the SOURCE, not of this content. Adapting A or B yields C — see canClaimAuthorityClass. */
      sourceAuthorityClass: "A" | "B" | "C" | "D";
      changeSummary?: string;
    } | null;
  };

/** The wire form of the product's hardest mechanic. The engine implements it in citadel (DEC-009); this is what crosses a service boundary. R4 B1, B2. */
export type Consequence = {
    /** ★ THE TRACEBACK ROOT. minItems:1 — a consequence with no cause has no chain to assemble later, and becomes the arbitrary event the mechanic exists to avoid. */
    caused_by: string[];
    /** All three trigger forms, deliberately separate. A chapter boundary is dramatic structure; a variable threshold is accumulated state; a prior decision is a specific act. Collapsing them loses which KIND of thing caused the arrival — which is what the traceback has to say. */
    surfaces_at: {
      chapter?: string;
      variable_threshold?: {
        variable: string;
        band: "critical" | "strained" | "adequate" | "strong";
        comparison?: "at-or-below" | "at-or-above";
      };
      after_decision?: string;
    };
    /** ★ `independent` and `uncertain` are members on purpose. Claiming a link that does not exist is the same failure as hiding one that does. */
    relationship: "demonstrated" | "shared-vulnerability" | "precursor" | "response-created" | "compound" | "independent" | "uncertain";
    /** ★ REQUIRED. Operational alone is a status change nobody feels. */
    emotional: string;
    /** ★ REQUIRED. Emotional alone is a mood with no cost. */
    operational: string;
    player_could_have_known: boolean;
    foreshadowed_at?: string | null;
  };

/** A flag raised on content or a run. R4 B7. ⚠️ SEPARATE FROM RESULTS, deliberately: a flag folded into a result payload becomes a mark against whoever the result is about, and the flag layer exists to surface a PROBLEM WITH THE CONTENT, not a judgement about a person. */
export type Flag = {
    id: string;
    /** A content or run reference. NEVER a participant. */
    raisedAgainst: string;
    /** Every member is about the CONTENT. There is no member for 'this person did badly'. */
    kind: "content-inaccurate" | "content-unsafe" | "content-unclear" | "binding-unresolvable";
    reason: string;
    state: "open" | "accepted" | "declined" | "superseded";
    resolution?: string | null;
  };

export type Answer = {
    promptKey: string;
    text: string;
  };

/** Chapter 1's real output. A PERSONAL PREPAREDNESS OBSERVATION — not a critical-service map, not an assessment, not facility evidence. Canon: 'No formal assessment or transfer artifact is completed in Chapters 1-3.' The six boundaries below are what distinguish this from the artifact canon prohibits; if any is violated, this is the prohibited artifact with a new noun on it. R4 B4, DEC-008. */
export type ObservationRecord = {
    id: string;
    /** ★ BOUNDARY 1 — PARTICIPANT-OWNED. Keyed to the person, never to the facility. A record keyed by facility is facility evidence whatever it is called, and it would survive the participant leaving in the wrong direction. */
    participantRef: string;
    chapter: string;
    /** ★ BOUNDARY 1 — PRIVATE UNTIL DELIBERATELY PROMOTED. A `const`, not an enum: there is no other value to set. Not visible to a coordinator, not visible to the facility. */
    visibility: "participant-private";
    /** ★ BOUNDARY 4 — the last two are REQUIRED, and they are what make this an observation rather than a finding. Without them it asserts an assessed dependency, which is the artifact. */
    sections: {
      service: Answer;
      /** The product delivered once: 'What is keeping your service running that is not written down?' */
      undocumentedDependency: Answer;
      /** REQUIRED. 'What would you need to check before treating this as established?' */
      notSureAbout: Answer;
      /** REQUIRED. 'Who would you ask, and what would you ask them?' */
      questionToAsk: Answer;
    };
    /** ★ BOUNDARY 5 — carried on every export, alongside the scope-boundary statement. A `const` so it cannot be softened, shortened or localised into something that sounds like a finding. */
    exportLabel: "unverified personal preparedness observation — not an assessment";
    /** ★ BOUNDARY 6 — the ONLY route into Chapter 4's facility-owned artifact, and it requires explicit confirmation and correction. ⚠️ Q19 owes who initiates it, who sees the record before and after, whether the participant may withdraw first, and what provenance survives. Until then this stays null. */
    promotion?: {
      confirmedByParticipant: true;
      correctedAt: string;
      promotedTo: string;
    } | null;
    createdAt?: string;
    /** Where in the fiction this came from. A reference, never a copy. */
    provenance?: {
      sceneId?: string;
      decisionId?: string;
      bundleVersion?: string;
    };
  };

/** Structured prompts, and the participant's own words extracted from them. R4 B3. */
export type Reflection = {
    participantRef: string;
    responses: {
      promptKey: string;
      /** ★ THE PARTICIPANT'S OWN WORDS. Never a selection from options we wrote — a reflection assembled from our sentences reflects us. */
      text: string;
    }[];
    /** ⚠️ Q20 owes the mechanism. Recognition is for the QUALITY OF INQUIRY, never for the safety state described — DEC-005. Null until Q20 closes. */
    quality?: {
      rubricVersion: string;
      assessedBy: string;
    } | null;
  };

/** How a COHORT is inquiring. Opt-in, cohort-bounded, and about behaviour — never about any hospital's safety state. R4 B6. ⚠️ FOUR SEPARATE PAYLOADS, and no payload may combine views. A payload holding a facility's capability beside another facility's is one query-string change from a league table — and DEC-005 is absolute: rank inquiry, never rank a hospital. */
export type ResultCohortInquiry = {
    cohortRef: string;
    optedIn: true;
    inquiryPatterns?: string[];
  };

/** The state of the CONTENT — unclassified, awaiting review, expired. Computed, never authored. R4 B6. ⚠️ FOUR SEPARATE PAYLOADS, and no payload may combine views. A payload holding a facility's capability beside another facility's is one query-string change from a league table — and DEC-005 is absolute: rank inquiry, never rank a hospital. */
export type ResultContentGovernance = {
    generatedAt: string;
    unclassified?: string[];
    awaitingReview?: string[];
  };

/** What a FACILITY has evidenced, calculated by checklist-api and nowhere else. R4 B6. ⚠️ FOUR SEPARATE PAYLOADS, and no payload may combine views. A payload holding a facility's capability beside another facility's is one query-string change from a league table — and DEC-005 is absolute: rank inquiry, never rank a hospital. */
export type ResultFacilityCapability = {
    facilityRef: string;
    calculatedBy: "checklist-api";
    blocks?: string[];
  };

/** What THIS participant did and learned. Person-scoped. No other participant appears in this payload. R4 B6. ⚠️ FOUR SEPARATE PAYLOADS, and no payload may combine views. A payload holding a facility's capability beside another facility's is one query-string change from a league table — and DEC-005 is absolute: rank inquiry, never rank a hospital. */
export type ResultPersonalProgress = {
    participantRef: string;
    chaptersPlayed?: string[];
    /** For the QUALITY OF INQUIRY. 'Named the Gap' is the highest-value one — DEC-005. */
    recognitions?: string[];
  };

/** A COMPLETE, ORDERED chain from a consequence back to the decision that caused it. Complete matters: a chain missing its middle reads as a coincidence, and the participant is right to distrust it. R4 B2. */
export type Traceback = {
    consequenceRef: string;
    /** Ordered by when it happened, never by how it was stored. */
    chain: {
      sequence: number;
      sceneId: string;
      decisionId: string;
      optionId: string;
    }[];
    /** ★ Plain language, readable by a participant and not only by a developer. It names the SCENE, never an identifier. */
    narrative: string;
  };

/** SG-1 C3. AN OPERATIONAL CAPABILITY THE PARTICIPANT CAN COMMIT — and the reason opportunity in this product is not a resource bar. ★ A CAPABILITY IS A NAMED HOLDER IN A NAMED STATE. Never a pool, a meter, a budget, a point, a token or a countdown. Canon names time, trust, workload, service capacity and evidence as the currencies of this world and sets no prices for any of them; a number invites optimisation, which is the behaviour this product exists to make harder rather than easier. So there is no `amount` here, and no `remaining`, and adding one is a change to what the product is. What a capability has instead is a HOLDER — a person, a set of equipment, a route, a record — who can be somewhere, doing something, and who can therefore not be somewhere else. That exclusivity is the whole constraint, and it survives the removal of every clock, which is why the non-timed accessibility path carries the same trade-off rather than a relaxed one. */
export type Capability = {
    /** Referenced by a decision option's `commits`. Prefixed so a dangling reference is visible on sight. */
    id: string;
    /** The locale key. A capability the participant meets in one language only is a capability half the audience cannot reason about. */
    name_key: string;
    /** WHO OR WHAT HOLDS IT. A capability with no holder is a pool with a different name. */
    held_by: {
      kind: "person" | "equipment" | "route" | "record";
      id: string;
    };
    /** What canon says is available, in canon's own terms — 'the roster safely covers about 28 while 30 are occupied', 'the set exists but must be found, verified and delivered'. Prose, deliberately: a figure copied out of canon into a field the engine can do arithmetic on is a quantity by the back door. */
    available_state: string;
    /** The instrument that reports its status. ★ A capability the participant cannot READ is a hidden variable, and a hidden variable that closes an option is the definition of an arbitrary game. */
    how_known: string;
    /** What commits it, in the world's terms. Not an exhaustive engine list — the authoritative binding is the option's own `commits`. */
    consumed_by?: string[];
    opens?: string[];
    /** What becomes unavailable once it is committed. This is where the trade-off lives, and it is stated in words because canon states it in words. */
    closes?: string[];
    /** What remains after the incident closes. Null only where canon is silent — and where canon is silent, `unresolved` on the scene is the honest place for it. */
    residue?: string | null;
    /** The canon passage. Required, so a reviewer can see what is transcription and what is interpretation. */
    derivedFrom: string;
  };

/** No user-visible string is ever a literal. */
export type LocalisedText = {
    key: string;
    fallback?: string;
  };

export type Option = {
    id: string;
    label: LocalisedText;
    /** What this option keeps safe. REQUIRED AND NON-EMPTY: every option must protect something legitimate. */
    protects: string;
    risks: string;
    /** ★ WHO would defend this choice, and why. Non-empty is the test that the option is a real position held by real people — not a decoy. R3's definition of done asserts it. */
    defensible_by: string;
    prerequisites?: string[];
    deferred_consequence?: string | null;
    /** ★ THE REASON the asymmetry is deliberate, not a flag that it is. A boolean records that somebody noticed; a sentence records what they concluded — e.g. 'Canon assigns C1_FRONTLINE_TRUST -1 and names no compensating systemic gain.' An unbalanced option with no explanation is a design defect; with one, it is a design decision. */
    deliberately_asymmetric?: string | null;
    effects: Effect[];
    /** EVS-4. FPE-05: option risks are available before commitment WHENEVER THE PLAYER'S ROLE COULD REASONABLY KNOW THEM. Until EVS-4 every risk was unconditionally visible, which reads as a briefing rather than as something learned. When this names evidence, the option's `risks` is withheld until the participant holds it — so investigating changes what the decision looks like. ⚠️ NOT EVERY OPTION MAY BE GATED. `protects` is never withheld, and a decision whose every risk is gated shows a participant who inspected nothing a set of options with no trade-offs at all — FPE-03 broken from the other side. The consumer enforces that; a schema cannot see across options. */
    risk_requires_evidence?: string[];
    /** SG-1 C1/C3. WHAT THIS OPTION COMMITS, AND TO WHAT. ★ THIS IS WHERE AN OPTION STOPS BEING A SENTENCE AND STARTS BEING A STRATEGY. Before SG-1 every option was free: a participant who took every action and then chose was strictly better off than one who chose, so there was no choosing. An option commits named holders — hands, a set, a route, an engineer's presence, a copyist's attention — and a holder who is committed is somewhere, doing something, and is therefore not available for the other thing. ⛔ THERE IS NO AMOUNT HERE, AND ADDING ONE IS A CHANGE TO WHAT THE PRODUCT IS. Canon names time, trust, workload, service capacity and evidence and sets no prices. A quantity invites optimisation; exclusivity does not, and exclusivity survives the removal of every clock, which is what keeps the non-timed accessibility path carrying the same trade rather than a relaxed one. */
    commits?: ({
      /** The capability committed. Its shape is capability.schema.json, and its holder is declared there rather than repeated here. */
      capability: string;
      /** `committed` — the holder is doing this now and can be released later. `consumed` — it is gone for this chapter. There is deliberately no `available`: an option that RELEASES capability without committing any is an option with no cost, which the asymmetry rule already refuses. */
      becomes: "committed" | "consumed";
      /** What it is committed to, in the world's terms — 'holding the far bay by hand', 'carrying the set by the lower route'. */
      for?: string | null;
      derivedFrom: string;
    })[];
    /** WHERE THE PRESSURE GOES. Canon's Chapter 1 does not remove pressure from the Bimaristan; it MOVES it — to emergency care, to a donating service, to the network, to the workforce. An option that protects something and transfers nothing has either had its cost omitted or is not a real option, and `deliberately_asymmetric` is the field for saying which. */
    transfers_pressure_to?: string | null;
    /** SG-1 C4. WHAT IS STILL TRUE AFTER THE INCIDENT CLOSES. ⚠️ PER OPTION, NOT PER SCENE. `scene.residue` is one sentence about the scene, so three pathways with three different aftermaths shared one description of what was left behind — which is the same shape as three options sharing one consequence, and it is why the world did not appear to answer. ★ AND EVERY ENTRY BINDS TO SOMETHING THAT CAN PERSIST. A residue that binds to nothing can be described and cannot be shown: it will not survive a return to the hub, it will not survive a resume, and the participant will be told what remains rather than finding it there. */
    residue?: ({
      what: string;
      /** The thing in the world that carries it. Five kinds, because canon's Chapter 1 residues are exactly these: a bay whose board is locked out (location), a service route now relied on (route), a board that still cannot see the bay (instrument), a nurse still on recovery checks (person), and a mobile reserve that is not where it belongs (capability). */
      binds_to: {
        kind: "location" | "route" | "instrument" | "person" | "capability";
        id: string;
      };
      derivedFrom: string;
    })[];
  };

/** CORRECTION 2 (R3 B3). Effects were `up|down` plus a magnitude, which cannot express canon's enum state — `C1_CRITICAL_PATH = ED_HOLD | REDEPLOY | NETWORK_TRANSFER`. Operations are typed, and an enum operation must name both the variable and the value. */
export type Effect = {
    /** set_enum names a discrete state. increment/decrement move a scalar. set_band moves a banded scale. */
    operation: "set_enum" | "increment" | "decrement" | "set_band";
    enum_variable?: string;
    enum_value?: string;
    variable?: string;
    /** R3 B6. Canon writes +1/-1 and defines no mapping to these. The conversion is a recorded content judgement — see the decision log — and the owner may overturn it at the experience gate. */
    magnitude?: "slight" | "moderate" | "major";
    band?: string;
    /** ★ The delayed consequence is the product's hardest and most valuable mechanic. It is expressible from R3 even though it PAYS OFF at R4 — building the vocabulary last is how the prior attempt ended with a story that had no payoff. */
    delay: "immediate" | "later_this_chapter" | "next_chapter" | "later_season";
    /** Whether the player sees this effect land. An invisible immediate effect is how a consequence later reads as arbitrary. */
    visible: boolean;
  };

/** A decision inside a scene. EVERY OPTION PROTECTS SOMETHING LEGITIMATE AT A COST — an option with nothing to defend is not a decision, it is a wrong answer wearing a choice's clothes. R3 B3, B8. */
export type Decision = {
    id: string;
    scene: string;
    prompt: LocalisedText;
    /** WHICH ROLES hold the authority to decide — not whether authority is needed. A bare boolean cannot say who; a role not listed observes, and the interface can explain WHY it is observing. Same reasoning as named refusals over bare booleans. */
    requires_authority: string[] | null;
    reflection_required: boolean;
    /** The in-world time this would realistically take. DEC-014: an in-world deadline is permitted; speed is never scored. */
    realistic_window?: string | null;
    /** At least two. One option is not a decision. */
    options: Option[];
  };

/** SG-1 C2. A DIEGETIC OPERATIONAL INSTRUMENT — a physical object in the Bimaristan that reports something, with a source and a time. ★ THE INSTRUMENT IS NOT WHERE THE READING LIVES. A reading is EVIDENCE: it has a source, it is held by a participant who went and looked, and it may be partial. Declaring readings here would create a second knowledge system beside `scene.evidence`, and the two would disagree the first time one was updated. So an instrument declares WHAT IT IS and WHAT IT MUST NEVER IMPLY, and `evidence[].reading` says what was read from it and in what state. ★ AND `unavailable` IS A STATE, NOT AN ERROR. Canon builds this into the objects themselves: the Measure's weight room holds one weight per DECLARED dependency and 'shows nothing at all when a dependency was never declared'; a burned-out wick on the slate map 'reads exactly like a service that has stopped reporting'. The chapter's whole argument is that an instrument can be accurate and silent at the same time. An engine that models absence as failure cannot express it. */
export type Instrument = {
    /** Referenced by `evidence[].reading.instrument` and by `capability.how_known`. */
    id: string;
    name_key: string;
    /** WHAT IT PHYSICALLY IS, from the sensory canon — a copper message rail with a station bell and an amber shutter; a slate map pierced with holes backed by oil wicks; glass columns of coloured water showing a ratio and not a count. Not decoration: the object's affordances and failure modes ARE the instrument's states, and inventing a screen instead would discard canon that has already done this work. */
    object: string;
    /** ★ WHICH OTHER INSTRUMENTS THIS ONE CAN BE PLACED BESIDE. Comparison is the act that turns two true readings into a usable contradiction — the chapter turns on the Hall being right about the bus and wrong about the bay. An instrument comparable with nothing is a fact delivered, not a fact found. */
    comparable_with?: string[];
    /** ⛔ WHAT A READING FROM THIS INSTRUMENT MUST NOT BE TAKEN TO MEAN. Required and non-empty, because every one of these five instruments has a plausible misreading that the chapter is about: 'restored' is not 'the dependency is corrected'; an empty bed is not capability; 'battery available' is not safe care capability; a route on the map is not an open route; a preserved chronology is not a finding. A field nobody filled would be a rule that could never fire. */
    never_implies: string[];
    /** The locale key for the complete non-visual peer — the reading, its source, its time, its state and its disagreement, in words. Declared with the instrument so an instrument cannot exist without one. */
    text_equivalent_key: string;
    /** Where canon is silent about this object, say so here rather than inventing a default. */
    unresolved?: string | null;
    derivedFrom: string;
  };

/** The eleven engine variables, which check-plan.sh asserts map 1:1 to canon's eleven persistent consequence threads. An invented variable name fails the plan mechanically. */
export type SeasonVariable = "V1" | "V2" | "V3" | "V4" | "V5" | "V6" | "V7" | "V8" | "V9" | "V10" | "V11";

export type Band = "critical" | "low" | "fragile" | "adequate" | "strong";

/** CORRECTION 2. Typed operations, not direction plus magnitude alone. Canon assigns enum state (C1_CRITICAL_PATH = ED_HOLD | REDEPLOY | NETWORK_TRANSFER), which up/down cannot express. */
export type Effect = Record<string, unknown>;

export type Delay = "immediate" | "next_chapter" | "act";

/** R3 B7. THE ONE DEFINITION. A reference to a catalogue capability block, so a scene decision binds to real facility capability rather than to prose. NOTE WHAT IS NOT IDENTITY: tool_id. R3-tasks.md proposed {tool_id, block_id, catalogue_version}, and that CONTRADICTS the shared-credit design -- capability-block.schema.json states that two items in two different tools referencing ONE block share credit. Binding a ref to a tool would give the same block two different refs depending on which tool you arrived through, and a facility doing one piece of work would be credited twice or not at all. The block is keyed (id, version); the ref is keyed the same way. */
export type CapabilityBlockRef = {
    block_id: string;
    block_version: string;
    /** Which catalogue version the ref was resolved against. */
    catalogue_version: string;
    /** CONTEXT ONLY — where the player encountered this block. NOT part of the reference's identity. Two specifications (R3 B7 and scene-and-quest-schema.md 6a) put tool_id INSIDE the ref. Taken as identity that breaks shared credit: a capability block is deliberately shared across tools, so the same block reached through two tools would carry two identities and a facility doing one piece of work would be credited twice or not at all. Both readings are reconciled here: the field exists, because a surface needs to know which tool to open, and it is excluded from identity, because credit attaches to the block. Anything comparing or deduplicating refs uses block_id + block_version + catalogue_version. */
    tool_id?: string | null;
  };

/** A playable scene. ADOPTED from the R3 candidate draft (citadel-planning/10-content-candidates/chapter-01-bundle-v0.1) at sha256 fb177ccb0d9caaf7354d1e7e826c12a0998176b1aeef0bbf448380d86c488b53. That folder is now INPUT, not authority: this file is the schema. R3 B1. */
export type Scene = {
    id: string;
    chapter: string;
    quests?: string[];
    /** CORRECTION 1. Canon Scene 1 spans the Gate of Names, the Clinical Sorting Court and the emergency courts; Scene 2 spans three. A single location cannot express it. */
    locations: string[];
    present: string[];
    play_mode: "solo" | "small-team" | "facilitated" | "either";
    orientation: {
      key: string;
      what_matters_now: string;
    };
    desire: {
      character_id: string;
      wants: string;
    }[];
    friction: string;
    /** A scene with only orientation and no choice_or_discovery is the 'scene that only explains' failure, and is rejected. */
    choice_or_discovery: string;
    turn: string;
    residue: string;
    /** Dramatic and in-world. NEVER a real-time countdown, and never a scoring input (DEC-014). */
    in_world_deadline?: {
      closes_at?: string | null;
      consequence_if_missed?: string | null;
    };
    begins_after: string;
    ends_before: string;
    tension_axes: ({
      axis: "time" | "information" | "authority" | "resource" | "trust";
      severity: "light" | "moderate" | "hard";
    })[];
    role_variants: {
      role_id: string;
      starting_position: string;
      information_held: string;
      options_available: string[];
    }[];
    /** CORRECTION 4. Canon guarantees the clue REGARDLESS of role. Every entry must be reachable on every selectable role path; reachable_on_all_role_paths records that this was checked, and the validator refuses false. */
    required_reveals: {
      id: string;
      what: string;
      reachable_on_all_role_paths: true;
      how_each_role_reaches_it?: {
        role_id: string;
        route: string;
      }[];
      /** EVS-4. Which evidence discharges this reveal. BY ID: the guarantee that a clue cannot disappear because of role selection is only checkable if the link is a reference rather than a resemblance. */
      evidence_ids?: string[];
    }[];
    /** CORRECTION 3. The Chapters 1-3 prohibition is enforced by the SCHEMA, not by prose or a grep: a canon-violating scene is unloadable. Canon states 'No formal assessment or transfer artifact is completed in Chapters 1-3.' For ch-01..ch-03, kind MUST be observation_record or none. 'artifact' is not an accepted value anywhere in this draft. */
    real_world_bridge: {
      kind: "observation_record" | "none";
      id?: string | null;
    };
    gate?: {
      requires?: {
        variable: SeasonVariable;
        min_band: Band;
      }[];
      on_fail?: {
        substitute: string | null;
        absence_is_noticed: boolean;
      };
    };
    /** At least three must be true. */
    creative_tests: {
      someone_wants_something_now: boolean;
      legitimate_need_in_tension: boolean;
      reveals_character_through_action: boolean;
      exposes_operational_dependency: boolean;
      player_decides_or_influences: boolean;
      consequence_can_return: boolean;
      advances_mystery: boolean;
      transfers_to_real_hospital: boolean;
    };
    text_equivalent: {
      key: string;
    };
    skippable: true;
    static_fallback?: string | null;
    keyboard_reachable: true;
    /** EVS-5. A DECLARED SLOT, NOT A FILE PATH — and an OBJECT, not a string. ⚠️ THIS WAS A BARE STRING UNTIL v0.7.0, AND THE COMPUTED MANIFEST HAD NEVER SEEN A REAL SLOT ID. The consumer's manifest reads `slot.id` and `slot.asset_id`; the content shipped `"slot.ch01.gate-of-names"`. Every one of Chapter 1's eight slots was reported as `sc-01-01:?`, and the rule refusing a REQUIRED slot — the rule that keeps play from depending on an image — read `slot.required` on a string and could never fire. Both looked correct. Both were tested against object fixtures the content never produced. One shape, therefore. Two shapes for one thing is what produced this. */
    asset_slots?: ({
      id: string;
      kind: "environment" | "prop" | "character" | "plan" | "instrument";
      /** The locale key for the alt text. Declared with the slot, so a slot cannot be filled without one — an image with no text equivalent removes an access path that nobody notices is missing until somebody needs it. */
      alt_key: string;
      /** The weight budget, declared BEFORE binding. The audience is on slow connections; a budget agreed after the art arrives is a budget the art sets. */
      max_bytes: number;
      /** The reviewed crop, where one has been agreed. Null until the design package exists. */
      crop?: string | null;
      /** A concept reference — VA-00n in the story record. A CANDIDATE is not a binding: incidental architectural, costume, equipment and emblem details do not become canon by appearing in an image. */
      candidate_ref?: string | null;
      /** ⚠️ FALSE UNTIL AN INCLUSION REVIEWER HAS SEEN IT (Q10). Binding a candidate as canonical without that review is the thing the gate exists to prevent; building against a slot is not. */
      inclusion_reviewed: boolean;
      reviewed_by?: string | null;
      /** The operational states this slot must eventually carry — an outage location needs at least two. Declared with the slot so the requirement exists before the art does. */
      states?: string[];
      /** The file a candidate currently resolves to, where one has been produced. Named on the SLOT so a surface renders what the slot declares rather than a map it keeps of its own — the play surface hardcoded two filenames until v0.7.0, which is a second inventory of the art beside the manifest. Still a candidate: inclusion_reviewed governs whether it may be treated as canonical, and it is false everywhere. */
      candidate_file?: string | null;
    })[];
    /** Where canon is silent, record it here rather than inventing a default. 'No invented defaults' is the same rule the content baseline applies to clinical and engineering thresholds. */
    unresolved?: {
      field: string;
      why: string;
    }[];
    /** V9. The scene's emotional register, which drives how it opens. ⚠️ CANON ASSIGNS THE ARC PER CHAPTER, NOT PER SCENE. Chapter 1's is 'wonder -> professional belonging -> concentrated fear -> first unease' (one line, at chapter level). Distributing it across scenes is a DERIVATION, so `derivedFrom` carries the canon term the register came from and the two are never conflated. ⚠️ AND THE VOCABULARIES DO NOT ALIGN. art-direction-and-asset-model.md section 2 defines seven registers with visual meanings; canon's 'concentrated fear' is not one of them. The register enum below is the art model's, because those are the terms with a defined visual register — a state with no defined register cannot drive anything. */
    emotional_state?: {
      /** From art-direction-and-asset-model.md section 2. NOTE: that section says 'ten emotional states' and tabulates SEVEN. The three unlisted states have no defined visual register, so they are not enum members here — a member with no register would be a state nothing could render. */
      register: "wonder" | "belonging" | "unease" | "pressure" | "loss" | "recognition" | "earned-hope";
      /** The canon term this register was derived from, verbatim. Required so a reviewer can see the interpretation rather than inherit it. */
      derivedFrom: string;
      /** Set when canon does not name a register for this scene, saying what is unresolved. Canon is read-only; where it is silent that silence is recorded, never filled in. */
      unresolved?: string | null;
    } | null;
    /** EVS-1. WHEN each authored movement is presented. The six movements are SOURCE MATERIAL, not six headings to display before the player acts (Final Product Experience Contract section 2). FPE-01 is the invariant this field exists to make enforceable: `turn`, the immediate effect, the state delta and `residue` are not rendered before commitment. Without staging there is nothing for a runtime to obey — the current renderer emits all six movements as one ordered document, so the interface spoils its own drama and no rule can object. WHY PER SCENE AND NOT A CONSTANT. Today all four Chapter 1 scenes stage identically, and identical data in four places is a place for drift. It is per-scene anyway because the `interactive` phase varies per scene the moment EVS-4 adds inspect/compare and consult/coordinate actions — and because a mapping that can be WRONG is a mapping the schema can refuse. A constant would make the refusal tests below unwritable. THE PHASE SEQUENCE ITSELF IS NOT DATA. pre_commit -> interactive -> post_commit -> scene_exit is fixed by this object's four required keys, so a scene cannot declare its phases out of order. What a scene CAN get wrong is which movement sits in which phase, and each phase's `items` enum is what refuses that. */
    staging?: {
      /** Arrive and encounter. What the player may see BEFORE they act. `turn` and `residue` are absent from this enum on purpose — that absence is FPE-01. */
      pre_commit: ("orientation" | "desire" | "friction")[];
      /** Investigate, coordinate, commit. EVS-1 shipped one member and said why: 'members are not declared before the action they name exists — an enum member nothing can produce is a rule that cannot fire.' EVS-4 built the actions, so `actions` joins it here. `actions` stages the scene's inspect and consult controls. `choice_or_discovery` stages the commitment. A scene may present both, and the order in the array is the order they appear — investigation before commitment is the point. */
      interactive: ("actions" | "choice_or_discovery")[];
      /** The response beat. FPE-02: a commitment receives an immediate causal response BEFORE navigation advances. `contains` makes `immediate_effect` mandatory here, so a scene cannot stage a response beat with nothing in it. */
      post_commit: ("turn" | "immediate_effect")[];
      /** What is left behind. `residue` is the only member, so residue staged anywhere else is refused by this enum and residue staged here is the only accepted form. */
      scene_exit: "residue"[];
    } | null;
    /** EVS-1. The response beat's material, per committed option. ★ THE STATE CHANGE IS NOT RESTATED HERE. It is the chosen option's own typed `effects` with `visible: true`, which decision.schema.json already governs. Copying them into the scene would be one shape defined twice — the defect `generate-types.js` exists to prevent, one layer up. ★ AND THE PROSE IS NOT INVENTED HERE. Chapter 1 canon authors, per pathway, the operational consequence and the state change; it authors no post-commitment narration. So `narrative_response` is null wherever canon is silent, and `derived_from` names the authored material the runtime composes the beat from instead. A null response with nothing to derive from would be an empty beat wearing a required field's name, which is why null requires both `derived_from` and `unresolved`. ⚠️ UNRESOLVED, DELIBERATELY: a discovery-only scene. `responses` is keyed by `option_id`, so a scene whose `choice_or_discovery` is prose rather than a decision reference cannot be represented. All four Chapter 1 scenes carry decisions, so nothing is blocked; a discovery shape is not invented here because EVS-4 is where discovery actions get defined and inventing one now would fix the wrong shape first. */
    immediate_effect?: {
      /** Where the player-observable state change comes from. One accepted value, because there is one authority: the decision option's typed effects. */
      state_change_source: "decision_effects";
      responses: ({
        option_id: string;
        /** Authored post-commitment prose, as a locale key. Null where canon authors none. */
        narrative_response: {
          key: string;
        } | null;
        /** Who reacts, and how. AN ARRAY, because canon reacts in more than one voice: the Chapter 1 closure characterization assigns Fadl, Maha AND Rami a different action per pathway, and a single-character shape would have forced two of the three to be dropped. Null where canon is silent -- never filled in. */
        character_response: {
          character_id: string;
          responds: string;
        }[] | null;
        /** Which authored material the runtime composes the response from when `narrative_response` is null. FPE-03 requires the response to name both the protected value and the cost, and `protects` + `risks` are exactly those, already authored on the option. */
        derived_from?: ("protects" | "risks" | "effects")[];
        /** Same convention as the scene's own `unresolved`: where canon is silent, say so rather than invent a default. */
        unresolved?: {
          field: string;
          why: string;
        }[];
        /** SG-1 C4. THE RESPONSE BEAT AS FOUR ORDERED LAYERS. ★ THE ORDER IS THE CAUSALITY: the place changes, then an instrument changes or visibly fails to, then a committed holder is somewhere doing something, then a person reacts. Rendered in that order a participant sees cause; rendered as a paragraph they read a claim. `FPE-02` says a commitment receives an immediate causal response; this is the field that makes 'causal' something other than an adjective. ★ AND THE STRONGEST LAYER IS OFTEN THE INSTRUMENT THAT DOES NOT CHANGE. Bridge the bay with a mobile source and it is supplied while the critical-power board still shows it unsupplied, because the board watches declared circuits. A participant who notices that has learned the chapter's argument by observation, which no sentence can do for them — so `instrument` is a required key and may be explicitly null, never simply omitted. All four keys are required and each may be null. Required-and-nullable rather than optional, because an author who has nothing for a layer should have to say so. */
        world_response?: {
          /** What the place is like now. Light, equipment, posture, sound — the layer canon stages first: 'the environment changes before explanatory prose'. */
          environment: {
            key: string;
            /** SG-1 C4. WHAT IN THE WORLD THIS CHANGED. A consequence that binds to nothing cannot persist, cannot be resumed and cannot be shown on the hub afterwards — it can only be described, which is the failure this release exists to correct. */
            binds_to?: {
              kind: "location" | "route" | "instrument" | "person" | "capability";
              id: string;
            } | null;
            derivedFrom: string;
          } | null;
          /** What a reading now says — INCLUDING when the honest answer is that it says exactly what it said before, and should not. */
          instrument: {
            key: string;
            /** SG-1 C4. WHAT IN THE WORLD THIS CHANGED. A consequence that binds to nothing cannot persist, cannot be resumed and cannot be shown on the hub afterwards — it can only be described, which is the failure this release exists to correct. */
            binds_to?: {
              kind: "location" | "route" | "instrument" | "person" | "capability";
              id: string;
            } | null;
            derivedFrom: string;
          } | null;
          /** Where a committed capability now is. Whose hands, which set, which route, which marks. */
          holder: {
            key: string;
            /** SG-1 C4. WHAT IN THE WORLD THIS CHANGED. A consequence that binds to nothing cannot persist, cannot be resumed and cannot be shown on the hub afterwards — it can only be described, which is the failure this release exists to correct. */
            binds_to?: {
              kind: "location" | "route" | "instrument" | "person" | "capability";
              id: string;
            } | null;
            derivedFrom: string;
          } | null;
          /** Who reacted, and how. Canon authors character reactions for one Chapter 1 decision only; everywhere else this is null with the gap recorded, because a derived character reaction is an invented performance. */
          person: {
            key: string;
            /** SG-1 C4. WHAT IN THE WORLD THIS CHANGED. A consequence that binds to nothing cannot persist, cannot be resumed and cannot be shown on the hub afterwards — it can only be described, which is the failure this release exists to correct. */
            binds_to?: {
              kind: "location" | "route" | "instrument" | "person" | "capability";
              id: string;
            } | null;
            derivedFrom: string;
          } | null;
        } | null;
      })[];
    } | null;
    /** V7. WHERE THE SCENE SITS IN THE DAY, IN THE WORLD’S OWN CLOCK. Canon’s Chapter 1 contract gives the played duration as “First Bell to shortly after the Third Bell”, and each scene setup names its bell. Position told as “Scene 2 of 4” would be true of any content; this is true of this world. ⚠ THIS FIELD SHIPPED IN CONTENT BEFORE IT EXISTED HERE. `citadel` PR #25 added `bell` to all four Chapter 1 scenes; this schema is `additionalProperties: false`, so every one of those scenes was INVALID against the contract it pinned — and nothing found out, because citadel validated no content against the pinned schemas at all. EVS-1 added that validation and it failed on the first run. The gap was the check, not the field. THE ENUM IS CHAPTER 1’S BELLS. Each member has a locale string; a bell with no string renders as its own key at the reader. A chapter naming a fourth bell extends this enum and adds its string in the same change — which is the point of an enum rather than a free string. */
    bell?: "first" | "first_quarter" | "second" | "third" | null;
    /** EVS-4. WHAT CAN BE LEARNED, AND FROM WHOM. ★ EVIDENCE IS PARTIAL AND IT HAS A SOURCE. Canon's Chapter 1 is built on two people reading accurate information in different rooms and reaching different conclusions — the Hall sees 'backup generation active', the far bay sees no supply. An engine that holds one true world state cannot express that; an engine that holds WHO SAID WHAT can. A scene declares its evidence here and its ACTIONS reveal it. Nothing is discovered by arriving. */
    evidence?: ({
      id: string;
      what: string;
      /** WHO OR WHAT IS SAYING THIS. Provenance travels with the fact, so a later debrief can ask where a belief came from rather than treating every held fact as equally sound. */
      source: {
        kind: "person" | "instrument" | "place" | "record";
        id: string;
      };
      /** Whether this fact is incomplete on its own. Canon: the map is accurate and stops before the chamber; the Hall reading is true and is not the whole truth. `false` marks a fact that stands alone. */
      partial?: boolean;
      /** The required_reveal this evidence discharges, if any. WIRED BY ID, NEVER MATCHED ON PROSE — canon guarantees the clue regardless of role, and a guarantee checked by string comparison is not checked. */
      satisfies_reveal?: string | null;
      /** The canon passage this was transcribed from. Required, so a reviewer can see what is canon and what is interpretation. */
      derivedFrom: string;
      /** SG-1 C2. WHAT THIS EVIDENCE IS, READ AS AN INSTRUMENT STATE. ★ ONE KNOWLEDGE SPINE, NOT TWO. A reading is evidence — it has a source, it is held only by a participant who went and looked, and it may be partial. Adding a parallel `instrument_readings` array beside `evidence` would define what the participant knows in two places, and the two would disagree the first time one was updated. So an instrument reading IS a piece of evidence, with this object saying which instrument and in what state. Optional, because not all evidence comes off an instrument: Rami showing you a board behind an arch is a person, not a reading. */
      reading?: {
        /** The instrument this was read from. Must be an instrument the world declares; a reading of something that does not exist is a fact with a fictional provenance. */
        instrument: string;
        /** ⛔ `unavailable` IS A STATE, NOT AN ERROR, and it is the one this chapter is built on. The Hall's display does not see the failed downstream board; the Measure holds no weight for a dependency that was never declared; the message rail stops. Each of those is an accurate instrument saying nothing, and an engine that models silence as failure cannot express the difference between 'nothing is wrong' and 'nothing is being watched'. `conflicting` is the other load-bearing one: two readings that are both true and cannot both be acted on. */
        state: "known" | "uncertain" | "conflicting" | "unavailable" | "changed";
        /** Where in the incident's chronology this was read. Canon's electrical sequence has named marks — loss, generator running, main bus restored, the exception persisting, isolation and the manual feed. A mark, never a timestamp: the participant does not play against a clock, and a field holding seconds is a countdown waiting for someone to render it. */
        mark?: string | null;
      } | null;
    })[] | null;
    /** EVS-4. WHAT THE PARTICIPANT CAN DO BEFORE COMMITTING. ★ CANON ASKED FOR BOTH OF THESE BY NAME. Inspection: 'place detailed timings in OPTIONAL INSPECTION or the later review rather than long crisis dialogue.' Consultation: 'The selected role supplies one direct authority. The player must SEEK OTHER JUDGMENTS from named clinical, nursing, operational, safety, information, and city partners.' So the two action types are not a mechanic invented for a games checklist; they are how canon says the chapter is played. The third — commit — is `choice_or_discovery`, which already existed. */
    actions?: ({
      id: string;
      /** INSPECT reads a place, instrument or record. CONSULT asks a person, and a person may answer, qualify, refuse or withhold. The distinction is not cosmetic: only a person can decline. */
      type: "inspect" | "consult";
      target: {
        kind: "person" | "instrument" | "place" | "record";
        id: string;
      };
      /** Evidence ids from this scene. An action that reveals nothing is a button, and a button that does nothing teaches that the buttons do nothing. */
      reveals: string[];
      /** Which roles may take this action. Null means every role. ⚠️ ROLE FILTERING MUST NOT BREAK THE GUARANTEE: canon states a required clue 'cannot disappear because of role selection', so a reveal must stay reachable through SOME action for every selectable role. That is a cross-document rule and lives in the consumer, not here. */
      visible_to_roles?: string[] | null;
      /** Evidence that must already be held for this action to be available. Used sparingly: canon narrates one comparison that genuinely follows from two prior sightings, and manufacturing further chains would be inventing structure. */
      requires?: string[];
      /** ★ WHAT THE PERSON DOES, IN THEIR OWN POSITION. ⚠️ `does`, NOT `says`. Canon authors the ACT and not the line: "Fadl classifies the patient-safety event and sets quality follow-up without taking clinical or electrical authority", "Rami defines what may be safely energized", "the nursing leader corrects the interpretation". Those are canon’s own sentences. Turning them into dialogue would be writing the script, which is exactly the invention this project refuses — so the field holds what canon describes, and the dialogue is owed content rather than quietly supplied. `withholds` is the limit canon gives the same person: "the professional owner states the binding limit and acts within existing authority." A consult with no limit is a vending machine with a face on it. */
      response?: {
        character_id: string;
        withholds?: string | null;
        /** True where canon has the character act under their own authority whether or not the player asked — Rami isolating the board is the shipped case. */
        acts_independently?: boolean;
        /** Canon’s own description of what this person does. Transcribed, never composed. */
        does: string;
        /** Where the eventual line is owed. Canon describes the act and writes no dialogue for it; saying so keeps the gap visible instead of letting a description pass for a performance. */
        dialogue_unresolved?: string | null;
      } | null;
      /** ⚠️ A DECLARED NOTE, NOT A QUANTITY. Canon names the currencies — 'a cost in time, trust, workload, service capacity, or evidence' — and attaches them to unsafe proposals and the fail-forward. It sets no prices. A number invented here would be a score wearing a lore costume, which DEC-005 exists to prevent, so this is rendered and recorded and never summed. */
      cost?: {
        currency: "time" | "trust" | "workload" | "service_capacity" | "evidence";
        what: string;
      } | null;
      derivedFrom: string;
    })[] | null;
    /** EVS-5. WHERE THE SCENE IS, AS REFERENCES. ⚠️ ALONGSIDE `locations`, NOT INSTEAD OF IT — and the duplication is deliberate. `locations` holds canon's own phrases: "older ICU far bay", "the service passage to the electrical transfer chamber". Those are the writer's voice and they belong in the scene. `location_ids` are the machine's, and they resolve against a place model that can say what is next door and what changed there. Replacing the prose with ids would lose canon's wording; matching the ids to the prose by string comparison would be a resemblance standing in for a reference, which is the mistake `required_reveals.evidence_ids` was added to avoid one field over. Same pattern as `derivedFrom`: the source stays, and the link is explicit. The place model itself is NOT here. Nothing but the game consumes locations, and VERSIONING.md is explicit that a rule no other service consumes buys nothing by being published (DEC-009). It lives in citadel as `src/content/places.json`. */
    location_ids?: string[];
    /** SG-1 C5. WHAT A CHARACTER DOES, AND WHEN. ★ A WANT IS NOT A PERFORMANCE. `desire` says what each character wants; it is authoring data and it is what the current build renders — a bulleted list of six people's intentions, displayed before anything happens. Drama is those wants COLLIDING in front of the participant, so this array carries the acts: who speaks, who acts, who refuses, who qualifies, and who proceeds without the participant. ★ AND A REFUSAL IS NOT AN ERROR MESSAGE. Canon: 'the relevant professional explains the binding constraint and requires another pathway. This is authority, not a game hint.' A refusal here is a person exercising authority they hold, which is why it is a beat with a voice and not a validation failure with a tone. */
    character_beats?: ({
      id: string;
      character_id: string;
      /** Which beat it plays in. ⚠️ `entrance` is separate from `pre_commit` because canon controls entrances by name: 'Fadl and Maha enter after the first stabilization and electrical-isolation actions are under way; the scene does not wait for them before care begins.' A schema that cannot express a late entrance cannot refuse an early one. */
      at: "entrance" | "pre_commit" | "interactive" | "post_commit" | "scene_exit";
      /** ★ FIVE KINDS, BECAUSE THE DIFFERENCES ARE THE DRAMA. A refusal is a professional declining within their authority. A qualification is 'not until I can see the reserve, the accessories and who is using it' — an answer with a condition on it, which is Yasin's whole function. An independent_action is somebody doing their job WITHOUT the participant, which canon requires as its fail-forward rule and which no current beat can express. */
      kind: "speech" | "action" | "refusal" | "qualification" | "independent_action";
      /** What the beat performs — a want, a contradiction, a qualification, a refusal or a consequence. Non-empty is the test that the beat exists for a reason: 'no line exists only to recite the lesson' is the content rule, and a beat that cannot name what it performs is one. */
      performs: string;
      /** The locale key for what is said. Null for a beat that is purely action. */
      line_key?: string | null;
      /** ⚠️ WHERE THE LINE IS OWED. Canon authors the ACT — 'Fadl classifies the patient-safety event and sets quality follow-up without taking clinical or electrical authority' — and not the sentence. A speech beat must therefore carry either an authored line or an explicit record that one is owed. Silence in both fields would be a character opening their mouth and nothing coming out, shipped. */
      dialogue_unresolved?: string | null;
      /** The option id this beat belongs to, or null for a beat that plays whatever the participant commits to. This is how a character's behaviour DIVERGES by pathway rather than being narrated as having diverged. */
      pathway?: string | null;
      /** The condition under which an independent_action fires — canon's fail-forward rule is 'if the player delays or chooses an unsafe coordination approach'. Required for that kind, because an independent act with no trigger either never happens or always does, and both are the opposite of the mechanic. */
      occurs_when?: string | null;
      derivedFrom: string;
    })[] | null;
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
  | "adaptation-may-not-claim-source-authority";

export interface Refusal {
  refusal: RefusalId;
  message: string;
  detail?: Record<string, unknown>;
}
