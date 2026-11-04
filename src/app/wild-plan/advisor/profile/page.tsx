
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { Wild } from "@/types/wild";
import type {
  TravelerReadinessProfile,
  TravelerExperience,
  TravelerFitness,
  TravelerActivity,
  TravelerSkillLevel,
  TravelerSkills,
} from "@/types/wildTravelerProfile";

import { getCurrentWild } from "@/lib/wildStore";
import {
  getOrCreateTravelerProfile,
  saveTravelerProfile,
} from "@/lib/wildTravelerProfileStore";

const experienceOptions: {
  value: TravelerExperience;
  label: string;
}[] = [
  { value: "unknown", label: "Not sure yet" },
  { value: "beginner", label: "Beginner — Limited outdoor experience" },
  { value: "intermediate", label: "Intermediate — Some independent trips" },
  { value: "experienced", label: "Experienced — Regular independent trips" },
];

const fitnessOptions: {
  value: TravelerFitness;
  label: string;
}[] = [
  { value: "unknown", label: "Not assessed yet" },
  { value: "light", label: "Light — Comfortable with easy activity" },
  { value: "moderate", label: "Moderate — Comfortable with sustained activity" },
  { value: "high", label: "High — Regular demanding physical activity" },
];

const activityOptions: {
  value: TravelerActivity;
  label: string;
}[] = [
  { value: "scenic-driving", label: "Scenic driving" },
  { value: "day-hiking", label: "Day hiking" },
  { value: "camping", label: "Camping" },
  { value: "backcountry-hiking", label: "Backcountry hiking" },
  { value: "off-road-driving", label: "Off-road driving" },
  { value: "photography", label: "Photography" },
  { value: "wildlife-watching", label: "Wildlife watching" },
];

const skillOptions: {
  value: TravelerSkillLevel;
  label: string;
}[] = [
  { value: "unknown", label: "Not assessed" },
  { value: "none", label: "No experience" },
  { value: "basic", label: "Basic knowledge" },
  { value: "confident", label: "Confident and practiced" },
];

const skillFields: {
  key: keyof TravelerSkills;
  label: string;
  description: string;
}[] = [
  {
    key: "navigation",
    label: "Navigation",
    description: "Maps, route finding and offline navigation",
  },
  {
    key: "firstAid",
    label: "First Aid",
    description: "Basic injury response and emergency skills",
  },
  {
    key: "camping",
    label: "Camping",
    description: "Campsite setup and overnight outdoor routines",
  },
  {
    key: "remoteTravel",
    label: "Remote Travel",
    description: "Travel where services and communication may be limited",
  },
];

export default function TravelerProfilePage() {
  const [wild, setWild] = useState<Wild | null>(null);
  const [profile, setProfile] =
    useState<TravelerReadinessProfile | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const current = getCurrentWild();
      setWild(current);

      if (current) {
        setProfile(getOrCreateTravelerProfile(current.id));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load traveler profile."
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  function changeProfile(
    changes: Partial<TravelerReadinessProfile>
  ) {
    setProfile((previous) =>
      previous ? { ...previous, ...changes } : previous
    );
    setSaved(false);
  }

  function toggleActivity(activity: TravelerActivity) {
    if (!profile) return;

    const exists = profile.activities.includes(activity);

    changeProfile({
      activities: exists
        ? profile.activities.filter((item) => item !== activity)
        : [...profile.activities, activity],
    });
  }

  function changeSkill(
    key: keyof TravelerSkills,
    value: TravelerSkillLevel
  ) {
    if (!profile) return;

    changeProfile({
      skills: {
        ...profile.skills,
        [key]: value,
      },
    });
  }

  function save() {
    if (!profile || !wild) return;

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const current = getCurrentWild();

      if (!current || current.id !== wild.id) {
        throw new Error(
          "Current Wild has changed. Reload this page before saving."
        );
      }

      const result = saveTravelerProfile(profile);
      setProfile(result);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save traveler profile."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="traveler-page">
      <div className="traveler-shell">
        <nav className="traveler-nav">
          <Link href="/wild-plan/advisor">
            ← WILD ADVISOR
          </Link>
          <Link href="/wild-plan/advisor/prepare">
            PREPARATION PLAN →
          </Link>
        </nav>

        <header className="traveler-header">
          <span className="eyebrow">
            ROAMLAB / KNOW YOUR READINESS
          </span>

          <h1>TRAVELER READINESS</h1>

          <p>
            A better expedition plan begins with an
            understanding of your experience,
            capabilities and intended activities.
          </p>
        </header>

        {!loaded && <p>Loading traveler profile...</p>}

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {loaded && !wild && (
          <section className="traveler-panel">
            <h2>No active Wild found</h2>
            <p>
              Create a Wild before completing your
              readiness profile.
            </p>
            <Link href="/wild-plan">
              OPEN WILD PLAN →
            </Link>
          </section>
        )}

        {wild && profile && (
          <>
            <section className="trip-context traveler-panel">
              <span className="eyebrow">
                CURRENT WILD
              </span>

              <h2>
                {wild.plan.adventure.destination?.name ??
                  "Destination not confirmed"}
              </h2>

              <p>
                {wild.plan.adventure.schedule?.days ?? "?"}
                {" "}DAYS ·{" "}
                {wild.plan.adventure.crew?.people ?? "?"}
                {" "}PEOPLE
              </p>

              <p className="context-note">
                This profile describes your current
                trip readiness. It does not assess every
                member of your group.
              </p>
            </section>

            <section className="traveler-section">
              <div className="section-heading">
                <span className="eyebrow">
                  01 / OUTDOOR EXPERIENCE
                </span>
                <h2>Your experience</h2>
                <p>
                  How familiar are you with planning and
                  completing outdoor trips independently?
                </p>
              </div>

              <div className="traveler-panel">
                <label htmlFor="experience">
                  EXPERIENCE LEVEL
                </label>

                <select
                  id="experience"
                  value={profile.experience}
                  onChange={(event) =>
                    changeProfile({
                      experience: event.target
                        .value as TravelerExperience,
                    })
                  }
                >
                  {experienceOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="traveler-section">
              <div className="section-heading">
                <span className="eyebrow">
                  02 / PHYSICAL READINESS
                </span>
                <h2>Your physical readiness</h2>
                <p>
                  Select the level that best reflects
                  your current activity capacity.
                </p>
              </div>

              <div className="traveler-panel">
                <label htmlFor="fitness">
                  ACTIVITY LEVEL
                </label>

                <select
                  id="fitness"
                  value={profile.fitness}
                  onChange={(event) =>
                    changeProfile({
                      fitness: event.target
                        .value as TravelerFitness,
                    })
                  }
                >
                  {fitnessOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="traveler-section">
              <div className="section-heading">
                <span className="eyebrow">
                  03 / PLANNED ACTIVITIES
                </span>
                <h2>What will you do?</h2>
                <p>
                  Choose all activities you expect
                  to include in this Wild.
                </p>
              </div>

              <div className="activity-grid">
                {activityOptions.map((option) => {
                  const checked =
                    profile.activities.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      className={`activity-option ${
                        checked ? "selected" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          toggleActivity(option.value)
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="traveler-section">
              <div className="section-heading">
                <span className="eyebrow">
                  04 / PRACTICAL SKILLS
                </span>
                <h2>Skills & confidence</h2>
                <p>
                  Rate your current practical experience.
                  Be realistic — unknown is a valid answer.
                </p>
              </div>

              <div className="skills-grid">
                {skillFields.map((field) => (
                  <div
                    key={field.key}
                    className="traveler-panel"
                  >
                    <h3>{field.label}</h3>
                    <p>{field.description}</p>

                    <label htmlFor={`skill-${field.key}`}>
                      SKILL LEVEL
                    </label>

                    <select
                      id={`skill-${field.key}`}
                      value={profile.skills[field.key]}
                      onChange={(event) =>
                        changeSkill(
                          field.key,
                          event.target
                            .value as TravelerSkillLevel
                        )
                      }
                    >
                      {skillOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </section>

            <section className="traveler-section">
              <div className="section-heading">
                <span className="eyebrow">
                  05 / GROUP CONSIDERATIONS
                </span>
                <h2>Additional support</h2>
                <p>
                  Does anyone in your group need
                  additional planning support for
                  the intended activities?
                </p>
              </div>

              <div className="traveler-panel">
                <label htmlFor="support">
                  GROUP SUPPORT REQUIREMENTS
                </label>

                <select
                  id="support"
                  value={
                    profile.additionalSupportNeeded === null
                      ? "unknown"
                      : profile.additionalSupportNeeded
                        ? "yes"
                        : "no"
                  }
                  onChange={(event) =>
                    changeProfile({
                      additionalSupportNeeded:
                        event.target.value === "unknown"
                          ? null
                          : event.target.value === "yes",
                    })
                  }
                >
                  <option value="unknown">
                    Not assessed yet
                  </option>
                  <option value="no">
                    No additional support identified
                  </option>
                  <option value="yes">
                    Yes — additional planning needed
                  </option>
                </select>
              </div>
            </section>

            <section className="traveler-section">
              <div className="section-heading">
                <span className="eyebrow">
                  06 / PERSONAL NOTES
                </span>
                <h2>Anything else?</h2>
                <p>
                  Add relevant experience, goals or
                  preparation concerns. Avoid entering
                  sensitive medical information.
                </p>
              </div>

              <div className="traveler-panel">
                <label htmlFor="notes">
                  PLANNING NOTES
                </label>

                <textarea
                  id="notes"
                  rows={5}
                  maxLength={2000}
                  placeholder="Example: First multi-day camping trip. Comfortable with easy hikes but unfamiliar with offline navigation."
                  value={profile.notes}
                  onChange={(event) =>
                    changeProfile({
                      notes: event.target.value,
                    })
                  }
                />
              </div>
            </section>

            <section className="save-section">
              <button
                type="button"
                className="save-button"
                disabled={saving}
                onClick={save}
              >
                {saving
                  ? "SAVING..."
                  : "SAVE TRAVELER PROFILE"}
              </button>

              {saved && (
                <p className="saved-message" role="status">
                  ✓ Traveler profile saved to this Wild.
                </p>
              )}

              <p className="disclaimer">
                This is a self-reported planning profile,
                not a fitness assessment or safety
                certification. Profiles are saved locally
                in this browser.
              </p>

              <Link href="/wild-plan/advisor/prepare">
                OPEN PREPARATION PLAN →
              </Link>
            </section>
          </>
        )}
      </div>

      <style jsx global>{`
        .traveler-page {
          min-height: 100vh;
          background: #101713;
          color: #f2e9d8;
          font-family: Arial, sans-serif;
          padding: 35px 24px 90px;
        }

        .traveler-shell {
          max-width: 1050px;
          margin: 0 auto;
        }

        .traveler-page a {
          color: #d6b17b;
          text-decoration: none;
        }

        .traveler-nav {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          font-size: 12px;
          letter-spacing: 1px;
        }

        .traveler-header {
          padding: 65px 0 38px;
        }

        .traveler-page .eyebrow {
          color: #c9a575;
          font-size: 11px;
          letter-spacing: 2px;
          font-weight: bold;
        }

        .traveler-page h1,
        .traveler-page h2,
        .traveler-page h3 {
          font-family: Georgia, serif;
          font-weight: normal;
        }

        .traveler-page h1 {
          font-size: clamp(36px, 5vw, 60px);
          margin: 15px 0;
        }

        .traveler-page h2 {
          font-size: 32px;
          margin: 12px 0;
        }

        .traveler-page h3 {
          font-size: 24px;
          margin: 0 0 12px;
        }

        .traveler-page p {
          color: #c4c7bc;
          line-height: 1.7;
        }

        .traveler-panel {
          background: #1c251e;
          border: 1px solid #475143;
          border-radius: 7px;
          padding: 28px;
        }

        .trip-context {
          background: linear-gradient(
            120deg,
            #2c3b2e,
            #1c251e
          );
        }

        .context-note {
          font-size: 12px;
          margin-top: 18px;
        }

        .traveler-section {
          margin-top: 55px;
        }

        .section-heading {
          margin-bottom: 20px;
        }

        .traveler-page label:not(.activity-option) {
          display: block;
          color: #d7b480;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 1px;
          margin-bottom: 13px;
        }

        .traveler-page select,
        .traveler-page textarea {
          width: 100%;
          background: #111913;
          color: #f2e9d8;
          border: 1px solid #78806e;
          border-radius: 4px;
          padding: 14px;
          font-family: Arial, sans-serif;
          font-size: 14px;
        }

        .traveler-page textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .activity-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(100%, 260px), 1fr)
          );
          gap: 14px;
        }

        .activity-option {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #1c251e;
          border: 1px solid #475143;
          border-radius: 6px;
          padding: 19px;
          cursor: pointer;
          color: #eee3d1;
        }

        .activity-option.selected {
          border-color: #c9a575;
          background: #303c2f;
        }

        .activity-option input {
          accent-color: #c9a575;
          width: 17px;
          height: 17px;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(100%, 420px), 1fr)
          );
          gap: 18px;
        }

        .skills-grid .traveler-panel p {
          min-height: 50px;
        }

        .save-section {
          margin-top: 60px;
          border-top: 1px solid #475143;
          padding-top: 30px;
        }

        .save-button {
          background: #c9a575;
          color: #152017;
          border: none;
          padding: 17px 28px;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .saved-message {
          color: #b9d5a9 !important;
          font-weight: bold;
        }

        .disclaimer {
          max-width: 650px;
          font-size: 12px;
          margin: 22px 0;
        }

        .error-message {
          background: #462d25;
          border: 1px solid #b77557;
          color: #ffe2d3;
          padding: 15px;
          margin: 20px 0;
        }

        @media (max-width: 600px) {
          .traveler-page {
            padding: 25px 16px 60px;
          }

          .traveler-header {
            padding-top: 45px;
          }

          .traveler-panel {
            padding: 20px;
          }
        }
      `}</style>
    </main>
  );
}
