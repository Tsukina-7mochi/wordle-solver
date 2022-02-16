import ProgressBar from "https://deno.land/x/progress@v1.2.4/mod.ts";
import { clue } from './types.ts';
import { wordMatchesToClue } from './util.ts';
import Evaluator, { evaluationFunc } from './evaluate.ts';

const answers = new Set(Deno.readTextFileSync('./wordle-answers-alphabetical.txt').split('\n'));
const guesses = new Set([...Deno.readTextFileSync('./wordle-allowed-guesses.txt').split('\n'), ...answers]);
const evaluator = new Evaluator(answers, guesses, evaluationFunc.fewestNextCandidate)


const guess = function(clue: clue, gameProgress: number): string {
  evaluator.clue = clue;
  evaluator.gameProgress = gameProgress;

  const progress = new ProgressBar({
    title: 'Choosing next guess',
    total: evaluator.possibleGuesses.size
  })

  console.log(`${evaluator.possibleAnswers.size} possible answers`);

  const scores: ({ word: string, score: number }[]) = [];
  let completed = 0;
  for(const candidate of evaluator.possibleGuesses) {
    const score = evaluator.eval(candidate);
    if(scores.length < 5 || scores[4].score < score) {
      scores.push({ word: candidate, score });
    }
    scores.sort((a, b) => b.score - a.score);
    while(scores.length > 5) {
      scores.pop();
    }

    completed += 1;
    progress.render(completed);
  }

  console.log(`Top ${Math.min(5, scores.length)} candidates`);
  for(let i = 0; i < Math.min(5, scores.length); i++) {
    console.log(`${scores[i].word} (${scores[i].score})`);
  }

  return scores[0].word;
}

export {
  guess
}