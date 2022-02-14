# Wordle Solver

**WIP**

## 概要

[Wordle](https://www.nytimes.com/games/wordle/index.html)の答えをできるだけ少ない手数で求めるソルバーです。

## 使用方法

同じディレクトリに [`wordle-allowed-guesses.txt`](https://gist.github.com/cfreshman/cdcdf777450c5b5301e439061d29694c) (入力可能な語のリスト)
と [`wordle-answers-alphabetical.txt`](https://gist.github.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b) (答えの語のリスト)を用意して

```shell
$deno run --allow-read --allow-env simulate.ts
```

- 答え・入力可能な語のリストのファイルを読むため `allow-read` が必要
- chalkを使用するため `allow-env` が必要
