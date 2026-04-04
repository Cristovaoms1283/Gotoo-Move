const fs = require('fs');
fetch("http://localhost:3000/api/check-db")
  .then(res => res.json())
  .then(data => {
    fs.writeFileSync("db_data_utf8.json", JSON.stringify(data, null, 2), "utf8");
    let summary = `Total Programs: ${data.programs.length}\n`;
    for(let p of data.programs) {
      summary += `- ${p.title} (Goal: ${p.goal}) - Workouts: ${p.workouts.length}\n`;
      for(let w of p.workouts) {
         summary += `  - ${w.label}: ${w.workout.title} (${w.workout.exercises.length} exercises)\n`;
      }
    }
    summary += `\nTotal Standalone Workouts: ${data.workouts.length}\n`;
    fs.writeFileSync("db_summary.txt", summary, "utf8");
    console.log("Feito!");
  }).catch(console.error);
