import { Program } from "@/lib/types/university";

/**
 * Formats a date string into a readable short date (e.g., "Oct 25, 2023").
 */
export const formatShortDate = (dateString: string | null) => {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Calculates information about a program's application deadline.
 */
export const getDeadlineStatus = (deadlineString: string | null) => {
  if (!deadlineString) {
    return {
      daysLeft: null,
      isExpired: false,
      urgencyColorClass: "text-primary-500 bg-primary-50",
      urgencyText: "Check for details",
      isUrgent: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(deadlineString);
  const timeDiff = deadline.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysLeft < 0) {
    return {
      daysLeft,
      isExpired: true,
      urgencyColorClass: "text-gray-500 bg-gray-50",
      urgencyText: "Expired",
      isUrgent: false,
    };
  }

  let urgencyColorClass = "text-green-600 bg-green-50";
  let urgencyText = `${daysLeft} days remaining`;
  let isUrgent = false;

  if (daysLeft <= 7) {
    urgencyColorClass = "text-red-600 bg-red-50";
    isUrgent = true;
  } else if (daysLeft <= 30) {
    urgencyColorClass = "text-amber-600 bg-amber-50";
  }

  return {
    daysLeft,
    isExpired: false,
    urgencyColorClass,
    urgencyText,
    isUrgent,
  };
};

/**
 * Determines scholarship status purely from tuition amounts.
 */
export const getTuition = (program: Program) => {
  const original = program.tuition_original;
  const after = program.tuition_after_scholarship;
  const scholarshipType = program.scholarship_type;
  const hasScholarship = after != null && original != null && after < original;

  const originalAmt = original ?? null;
  const afterScholarshipAmt = hasScholarship ? after : null;

  const displayAmt = afterScholarshipAmt ?? originalAmt;

  const savings = hasScholarship ? original! - after! : null;

  return {
    hasScholarship,
    originalAmt,
    afterScholarshipAmt,
    displayAmt,
    savings,
    scholarshipType,
    currency: program.tuition_currency || "RMB",
    tuitionPer: program.tuition_per || "year",
    livingCost: program.estimated_living_cost ?? null,
    livingCurrency: program.estimated_living_currency || "RMB",
  };
};
