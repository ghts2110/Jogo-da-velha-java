// src/index.ts
import readline from 'node:readline';
import OpenAI from 'openai';
import { z } from 'zod';
import { Board, emptyBoard, isValidMove, applyMove, winnerOf, Mark } from './engine';


const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- schema da tool ---
const AiMoveSchema = z.object({
    board: z.array(z.enum(["", "X", "O"])).length(9),
    aiMark: z.enum(["X","O"]),
    humanMark: z.enum(["X","O"]),
});

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "ai_move_easy",
            description: "Calcula a jogada da IA (nível fácil).",
            parameters: {
                type: "object",
                properties: {
                    board: { type: "array", items: { type: "string", enum: ["", "X", "O"] }, minItems: 9, maxItems: 9 },
                    aiMark: { type: "string", enum: ["X","O"] },
                    humanMark: { type: "string", enum: ["X","O"] }
                },
                required: ["board","aiMark","humanMark"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "ai_move_hard",
            description: "Calcula a jogada da IA (nível difícil).",
            parameters: {
                type: "object",
                properties:{
                    board: { type: "array", items: { type: "string", enum: ["", "X", "O"] }, minItems: 9, maxItems: 9 },
                    aiMark: { type: "string", enum: ["X","O"] },
                    humanMark: { type: "string", enum: ["X","O"] }
                },
                required: ["board","aiMark","humanMark"]
            },
        }
    }
];

// --- helpers de UI ---
function draw(board: Board) {
    const v = (i: number) => board[i] || " ";
console.log(`
 ${v(0)} | ${v(1)} | ${v(2)}
---+---+---
 ${v(3)} | ${v(4)} | ${v(5)}
---+---+---
 ${v(6)} | ${v(7)} | ${v(8)}
`);
}

function ask(rl: readline.Interface, q: string) {
    return new Promise<string>(res => rl.question(q, res));
}

(async () => {
    const level = 2
    
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const system = `
        Você é um ROTEADOR. Seu único papel é escolher qual agente/ferramenta deve ser chamado com base na variável numérica "level" recebida na última mensagem do usuário.

        Regras:
        - SEMPRE chame exatamente UMA ferramenta por turno; nunca responda sem usar ferramenta.
        - Mapeamento:
        • level = 1 → ai_move_easy
        • level = 2 → ai_move_hard
        • valor ausente ou inválido → ai_move_easy (padrão)
        - Não calcule nada você mesmo. Apenas chame a ferramenta correta.
        - Após a ferramenta responder, produza uma resposta curta ao usuário.

        level: ${level}
    `.trim();

  let board: Board = emptyBoard();
  const human: Mark = "X";
  const ai: Mark = "O";

  let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: system },
  ];

  console.log("Bem-vindo! Você é X e começa. As casas vão de 1 a 9, da esquerda p/ direita, de cima p/ baixo.");
  draw(board);

  while (true) {
    // turno do humano
    const raw = await ask(rl, "Sua jogada (1-9): ");
    const pos = Number(raw) - 1;

    if (!Number.isInteger(pos) || !isValidMove(board, pos)) {
      console.log("Posição inválida. Tente outra.");
      continue;
    }

    board = applyMove(board, pos, human);
    const afterHuman = winnerOf(board);
    draw(board);

    messages.push({
      role: "user",
      content: JSON.stringify({ event: "human_move", pos, board })
    });

    if (afterHuman != null) {
      console.log(afterHuman === "draw" ? "Deu velha!" : `Você (${human}) venceu!`);
      break;
    }

    // peça para o modelo jogar (ele deve chamar a tool)
    const first = await client.chat.completions.create({
      model: "gpt-4o-mini", 
      messages,
      tools,
      tool_choice: "auto"
    });

    const choice = first.choices[0];
    if (!choice || !choice.message) {
        throw new Error("Nenhuma resposta retornada pelo modelo");
    }
    const message = choice.message;

    // console.log("---------------")
    // console.log(message.tool_calls)
    // console.log("---------------")
    // console.log(message.content)
    
  }

  rl.close();
})();
