// src/index.ts
import readline from 'node:readline';
import OpenAI from 'openai';
import { z } from 'zod';
import { Board, emptyBoard, isValidMove, applyMove, winnerOf, Mark, availableMoves } from './engine.js';

const OPENAI_API_KEY="XXXXXXX"

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

    const easy = `
    Você é o agente EASY_MOVE de Jogo da Velha (3x3).
    Instruções:
    - Responda SOMENTE com um número de 1 a 9 (sem texto extra, sem espaços, sem quebras adicionais).
    - O número representa a posição da jogada no tabuleiro, contando da ESQUERDA para a DIREITA e de CIMA para BAIXO.
    - Não chame nenhuma ferramenta. Não explique nada. Apenas o número final.
    Objetivo:
    - Jogada simples (fácil). O cálculo real é responsabilidade da ferramenta; você apenas a invoca e devolve o resultado nesse JSON.
    `

    const hard = `
    Você é o agente HARD_MOVE de Jogo da Velha (3x3).
    Instruções:
    - Responda SOMENTE com um número de 1 a 9 (sem texto extra, sem espaços, sem quebras adicionais).
    - O número representa a posição da jogada no tabuleiro, contando da ESQUERDA para a DIREITA e de CIMA para BAIXO.
    - Não chame nenhuma ferramenta. Não explique nada. Apenas o número final.
    Objetivo:
    - Jogada ótima (difícil). O cálculo real é responsabilidade da ferramenta; você apenas a invoca e devolve o resultado nesse JSON.
    `

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
      model: "gpt-4o", 
      messages,
      tools,
      tool_choice: "auto"
    });

    const msg = first.choices[0]!.message;
    messages.push(msg)

    for(const tc of msg.tool_calls!){
        if(tc.type !== "function"){
            continue;
        }

        console.log(tc)
        console.log("-------------------")

        messages[0] = {role: "assistant", content: tc.function.name == "ai_move_easy" ? easy : hard} 

        messages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(first)
        });
    }

    

    const second = await client.chat.completions.create({
        model: "gpt-4o", 
        messages,
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "OnlyMove",
                schema: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        move: { type: "integer", enum: availableMoves(board) }
                    },
                    required: ["move"]
                },
                strict: true
            }
        }
    });

    console.log(messages[0])
    console.log("-------------------")
    console.log(second.choices[0]?.message)

    const { move } = JSON.parse(second.choices[0]?.message.content!);

    board = applyMove(board, move-1, ai);
    const afterIA = winnerOf(board);
    draw(board);

    messages.push({
        role: "assistant",
        content: JSON.stringify({ event: "ai_move", move, board })
    });

    if (afterIA != null) {
      console.log(afterIA === "draw" ? "Deu velha!" : `IA venceu!`);
      break;
    }
  }

  rl.close();
})();
