// src/lib/tree-stages.ts
// نظام مراحل الشجرة المعدل ليكون واقعياً ومحفزاً

export interface TreeStageInfo {
  leaves: number;
  branches: number;
  flowers: number;
  fruits: number;
  stage: string;
  nextStage: string;
  pointsToNext: number;  // عدد النقاط المتبقية للمرحلة التالية
}

export function getTreeStage(completedCount: number): TreeStageInfo {
  const leaves = completedCount;
  let branches = Math.floor(completedCount / 8);
  let flowers = Math.floor(completedCount / 25);
  let fruits = Math.floor(completedCount / 60);
  
  let stage = "بذرة";
  let nextStage = "ورقة";
  let pointsToNext = 5 - completedCount;

  if (completedCount >= 3) {
    stage = "ورقة";
    nextStage = "غصن";
    pointsToNext = 8 - completedCount;
  }
  if (completedCount >= 8) {
    stage = "غصن";
    nextStage = "شجرة صغيرة";
    pointsToNext = 15 - completedCount;
  }
  if (completedCount >= 15) {
    stage = "شجرة صغيرة";
    nextStage = "شجرة كبيرة";
    pointsToNext = 30 - completedCount;
  }
  if (completedCount >= 30) {
    stage = "شجرة كبيرة";
    nextStage = "شجرة مثمرة";
    pointsToNext = 50 - completedCount;
  }
  if (completedCount >= 50) {
    stage = "شجرة مثمرة";
    nextStage = "شجرة عملاقة";
    pointsToNext = 80 - completedCount;
  }
  if (completedCount >= 80) {
    stage = "شجرة عملاقة";
    nextStage = "غابة أثر";
    pointsToNext = 120 - completedCount;
  }
  if (completedCount >= 120) {
    stage = "غابة أثر";
    nextStage = "القمة";
    pointsToNext = 999; // لا حدود
  }

  return { leaves, branches, flowers, fruits, stage, nextStage, pointsToNext };
}
