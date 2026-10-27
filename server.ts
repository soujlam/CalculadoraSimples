import express, { Request, Response } from 'express';
import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CalculationRecord {
  id: string;
  expression: string;
  result: number;
  formattedResult: string;
  timestamp: string;
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Armazenamento em memória do histórico recente
let calculationHistory: CalculationRecord[] = [];

// Função auxiliar para chamar o motor em Python
function runPythonCalculator(payload: Record<string, unknown>): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.resolve(__dirname, 'engine', 'calculator.py');
    const jsonArg = JSON.stringify(payload);

    execFile('python3', [pythonScript, '--json', jsonArg], (error, stdout, stderr) => {
      if (error) {
        console.error('Erro na execução do script Python:', error, stderr);
        return reject(new Error('Falha ao comunicar com o motor de cálculo Python'));
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (parseErr) {
        console.error('Falha ao fazer parse do retorno Python:', stdout);
        reject(new Error('Resposta inválida do motor Python'));
      }
    });
  });
}

// Endpoint de cálculo via Python
app.post('/api/calculate', async (req: Request, res: Response) => {
  try {
    const { expression, operand1, operator, operand2 } = req.body;

    if (!expression && (operand1 === undefined || !operator || operand2 === undefined)) {
      res.status(400).json({ success: false, error: 'Expressão ou operandos não fornecidos.' });
      return;
    }

    const payload = expression ? { expression } : { operand1, operator, operand2 };
    const pyResult = await runPythonCalculator(payload);

    if (pyResult.success) {
      const record: CalculationRecord = {
        id: Math.random().toString(36).substring(2, 9),
        expression: pyResult.expression,
        result: pyResult.result,
        formattedResult: pyResult.formattedResult,
        timestamp: new Date().toISOString(),
      };

      // Limitar aos últimos 30 cálculos
      calculationHistory.unshift(record);
      if (calculationHistory.length > 30) {
        calculationHistory.pop();
      }

      res.json({
        ...pyResult,
        historyRecord: record,
      });
    } else {
      res.status(400).json(pyResult);
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Erro interno no servidor.',
    });
  }
});

// Endpoint para obter o histórico
app.get('/api/history', (_req: Request, res: Response) => {
  res.json({
    success: true,
    history: calculationHistory,
  });
});

// Endpoint para limpar o histórico
app.delete('/api/history', (_req: Request, res: Response) => {
  calculationHistory = [];
  res.json({
    success: true,
    message: 'Histórico limpo com sucesso.',
  });
});

// Endpoint de status e diagnóstico da integração Python
app.get('/api/status', (_req: Request, res: Response) => {
  execFile('python3', ['--version'], (error, stdout, stderr) => {
    const pythonVersion = stdout.trim() || stderr.trim() || (error ? 'Não detectado' : '3.10+');
    res.json({
      status: 'online',
      runtime: 'Node.js + Python Express Server',
      pythonVersion,
      historyCount: calculationHistory.length,
      timestamp: new Date().toISOString(),
    });
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Modo desenvolvimento com Vite middleware
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Modo produção
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT} (Modo: ${isProd ? 'produção' : 'desenvolvimento'})`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar servidor:', err);
  process.exit(1);
});
