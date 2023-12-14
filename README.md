MarshManOS Notes
================
Please grade my main branch, and I put my lab questions in their own folder. 
Also I added ls -a, format -quick, recover, hidden files, and fcfs.

Note: For project 4, I gave github copilot another shot, and it's actually pretty good. I took what I learned from project 3, 
and instead of trying to have it code something to start with and I try to make it work, I used its command completion while also 
asking questions to make me more efficient. The command completion is very nice; although it is wrong 25% of the time, it is easy to 
ignore. I would also ask questions like "How do I convert this string to hex?" and it would do it for me. For project 3, I tried to 
have AI code for me by giving it a prompt of what I wanted my code to do, but for project 4 I coded everything myself but used AI 
to help me if I got stuck on how to do something. In summary, I think I was a bit harsh on it at first, and although it does still 
make mistakes, I found a way to make me a little more efficient.

Note: For project 3, I tried to use github copliot. I talk about my experience with it in the comments, but to summarize, 
it's alright. I spent way more time debugging than if I coded myself, so it is not a time saver. It did show me 
different ways to solve a problem, and that was cool, but overall, it was not worth paying for.

2019 - 2021 Browser-based Operating System in TypeScript
========================================================

This is Alan's Operating Systems class initial project.
See https://www.labouseur.com/courses/os/ for details.
It was originally developed by Alan and then enhanced by alums Bob Nisco and Rebecca Murphy over the years.
Clone this into your own private repository. Better yet, download it as a ZIP file and use it to initialize your own repository for this class. 
Then add Alan (userid *Labouseur*) as a collaborator.

Setup TypeScript
================

1. Install the [npm](https://www.npmjs.org/) package manager if you don't already have it.
1. Run `npm install -g typescript` to get the TypeScript Compiler. (You probably need to do this as root.)

-- or -- 

1. [Download](https://www.typescriptlang.org/download) it from the TypeScript website.
2. Execute the intstaller.

Workflow
=============

Some IDEs (e.g., [Visual Studio Code](https://code.visualstudio.com), [IntelliJ IDEA](https://www.jetbrains.com/idea/), others) 
natively support TypeScript-to-JavaScript compilation and have tools for debugging, syntax highlighting, and more.
If your development environment lacks these then you'll have to compile your code from the command line, which is not a bad thing. 
(In fact, I kind of like that option.) Just make sure you configure `tsconfig.json` correctly and test it out.

A Few Notes
===========

**What's TypeScript?**
TypeScript is a language that allows you to write in a statically-typed language that outputs standard JavaScript.
It's all kinds of awesome.

**Why should I use it?**
This will be especially helpful for an OS or a Compiler that may need to run in the browser as you will have all of the great benefits of strong type checking and scope rules built right into your language.

**Where can I get more info on TypeScript**
[Right this way!](http://www.typescriptlang.org/)


