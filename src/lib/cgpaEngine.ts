export const GRADE_POINTS: Record<string, number> = {
  A: 5.0, B: 4.0, C: 3.0, D: 2.0, E: 1.0, F: 0.0,
};

export interface Course {
  id: string;
  code: string;
  title: string;
  credit: number;
  grade: string;
}

export interface Semester {
  id: string;
  name: string; // e.g., "100 Level First Semester"
  courses: Course[];
}

export function getDegreeClass(cgpa: number): { class: string; color: string } {
  if (cgpa >= 4.5) return { class: "First Class Honours", color: "text-success" };
  if (cgpa >= 3.5) return { class: "Second Class Upper", color: "text-primary" };
  if (cgpa >= 2.4) return { class: "Second Class Lower", color: "text-accent" };
  if (cgpa >= 1.5) return { class: "Third Class", color: "text-text-muted" };
  return { class: "Pass", color: "text-danger" };
}

export function calculateOverallCGPA(semesters: Semester[]) {
  let totalPoints = 0;
  let totalCredits = 0;

  semesters.forEach(sem => {
    sem.courses.forEach(course => {
      const points = GRADE_POINTS[course.grade] || 0;
      totalPoints += points * course.credit;
      totalCredits += course.credit;
    });
  });

  return {
    cgpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00",
    totalCredits,
    totalPoints
  };
}