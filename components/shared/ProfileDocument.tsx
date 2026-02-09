"use client";

import { StudentProfile } from "@/lib/types/student";
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import React from "react";

interface ProfileDocumentProps {
  profile: Partial<StudentProfile>;
  email?: string;
}

export const ProfileDocument = React.forwardRef<
  HTMLDivElement,
  ProfileDocumentProps
>(({ profile, email }, ref) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      ref={ref}
      className="bg-white p-8 md:p-12 max-w-4xl mx-auto print:shadow-none print:max-w-none print:w-full font-serif text-primary-900"
      id="printable-profile"
    >
      <div className="flex justify-between items-start border-b-2 border-primary-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">
            Student Profile
          </h1>
          <p className="text-primary-500 mt-1 text-sm">
            EduChinaPro Application Record
          </p>
        </div>
        <div className="text-right">
          <div className="font-bold text-xl brand-text">EduChinaPro</div>
          <div className="text-xs text-primary-400 mt-1 hidden print:block">
            Date:{" "}
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 print:grid-cols-3">
        <div className="md:col-span-2 print:col-span-2">
          <h2 className="text-2xl font-bold mb-4">
            {profile.first_name} {profile.last_name}
          </h2>

          <div className="space-y-2 font-sans text-sm">
            <div className="flex items-center gap-2 text-primary-700">
              <FiMail className="size-4 text-primary-400" />
              <span>{email || "No email provided"}</span>
            </div>
            <div className="flex items-center gap-2 text-primary-700">
              <FiPhone className="size-4 text-primary-400" />
              <span>{profile.phone_number || "No phone provided"}</span>
            </div>
            <div className="flex items-start gap-2 text-primary-700">
              <FiMapPin className="size-4 text-primary-400 mt-0.5" />
              <span>
                {profile.address}, {profile.city} {profile.zip_code}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:block print:block justify-self-end">
          <div className="size-32 bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-300 text-xs text-center p-2">
            Photo Area
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b border-primary-100 pb-2 mb-4 font-sans">
            Personal Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 text-sm">
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Nationality</p>
              <p className="font-semibold">{profile.nationality || "N/A"}</p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Gender</p>
              <p className="font-semibold font-manrope capitalize">
                {profile.gender || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Date of Birth</p>
              <p className="font-semibold">
                {formatDate(profile.date_of_birth)}
              </p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Passport No.</p>
              <p className="font-semibold">
                {profile.passport_number || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Marital Status</p>
              <p className="font-semibold">{profile.marital_status || "N/A"}</p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Religion</p>
              <p className="font-semibold">{profile.religion || "N/A"}</p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Mother Tongue</p>
              <p className="font-semibold">{profile.mother_tongue || "N/A"}</p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Visited China?</p>
              <p className="font-semibold">
                {profile.has_visited_china ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">
                Currently in China?
              </p>
              <p className="font-semibold">
                {profile.in_china_now ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b border-primary-100 pb-2 mb-4 font-sans">
            Education History
          </h3>
          {!profile.education_history ||
          profile.education_history.length === 0 ? (
            <p className="text-sm text-primary-400 italic">
              No education history recorded.
            </p>
          ) : (
            <div className="space-y-6">
              {profile.education_history.map((edu, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm pb-4 border-b border-dashed border-primary-100 last:border-0 last:pb-0 break-inside-avoid"
                >
                  <div className="md:col-span-1">
                    <p className="font-bold text-primary-900">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded mt-1 font-sans font-medium">
                      {edu.level}
                    </span>
                  </div>
                  <div className="md:col-span-3">
                    <h4 className="font-bold text-lg text-primary-900">
                      {edu.schoolName}
                    </h4>
                    <p className="text-primary-600 font-medium">
                      {edu.fieldOfStudy}
                    </p>
                    <p className="text-primary-500 text-xs mt-1">
                      GPA/Score: {edu.gpa}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b border-primary-100 pb-2 mb-4 font-sans">
            Documents Status
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-primary-500">
            <div className="flex justify-between items-center p-3 bg-primary-50 rounded border border-primary-100">
              <span>Passport</span>
              <span className="text-xs font-bold text-primary-400 uppercase">
                Pending
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary-50 rounded border border-primary-100">
              <span>High School Transcript</span>
              <span className="text-xs font-bold text-primary-400 uppercase">
                Pending
              </span>
            </div>
          </div>
        </section>

        <div className="hidden print:block fixed bottom-0 left-0 right-0 p-8 text-center text-xs text-primary-400 border-t border-primary-100">
          Confidential Document • EduChinaPro
        </div>
      </div>
    </div>
  );
});

ProfileDocument.displayName = "ProfileDocument";
