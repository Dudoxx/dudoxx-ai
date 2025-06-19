#!/usr/bin/env tsx

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { embed, embedMany } from 'ai';
import { 
  createDudoxx, 
  globalToolMonitor,
  withRetry,
  classifyError,
  getResponseMetadata 
} from '../src/index';

/**
 * Demo: Text embedding with DUDOXX models
 */
async function embedDemo() {
  console.log('🔗 DUDOXX Enhanced Embedding Demo\n');

  // Configure enhanced monitoring for embeddings
  globalToolMonitor.updateConfig({
    timeoutMs: 30000,
    maxRetries: 3,
    enableMetrics: true,
    enablePerformanceTracking: true,
  });

  console.log('📊 Enhanced Embedding Features:');
  console.log('- Performance tracking and analytics');
  console.log('- Automatic retry on failures');
  console.log('- Comprehensive error handling');
  console.log('- Batch processing optimization\n');

  // Initialize DUDOXX provider
  const dudoxx = createDudoxx({
    baseURL: process.env.DUDOXX_BASE_URL,
    apiKey: process.env.DUDOXX_API_KEY,
  });

  try {
    // 1. Single text embedding
    console.log('1. Single Text Embedding');
    console.log('='.repeat(40));
    
    const embeddingModel = dudoxx.embedding(process.env.DUDOXX_EMBEDDING_MODEL_NAME || 'embedder');

    const singleText = "The quick brown fox jumps over the lazy dog.";
    console.log(`Input text: "${singleText}"`);
    console.log('Generating embedding...\n');

    const { embedding, usage } = await embed({
      model: embeddingModel,
      value: singleText,
    });

    console.log(`Embedding generated!`);
    console.log(`Dimensions: ${embedding.length}`);
    console.log(`First 10 values: [${embedding.slice(0, 10).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log(`Usage: ${usage?.tokens || 'unknown'} tokens\n`);

    // 2. Multiple text embeddings
    console.log('2. Multiple Text Embeddings');
    console.log('='.repeat(40));

    const multipleTexts = [
      "Artificial intelligence is transforming technology.",
      "Machine learning models require large datasets.",
      "Natural language processing enables human-computer interaction.",
      "Deep learning networks have multiple layers.",
      "Neural networks are inspired by biological neurons.",
    ];

    console.log(`Input texts (${multipleTexts.length} items):`);
    multipleTexts.forEach((text, index) => {
      console.log(`${index + 1}. "${text}"`);
    });
    console.log('\nGenerating embeddings...\n');

    const { embeddings, usage: multiUsage } = await embedMany({
      model: embeddingModel,
      values: multipleTexts,
    });

    console.log(`${embeddings.length} embeddings generated!`);
    console.log(`Each embedding has ${embeddings[0].length} dimensions`);
    console.log(`Usage: ${multiUsage?.tokens || 'unknown'} tokens\n`);

    // 3. Embedding similarity analysis
    console.log('3. Embedding Similarity Analysis');
    console.log('='.repeat(40));

    // Calculate cosine similarity between embeddings
    function cosineSimilarity(a: number[], b: number[]): number {
      const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
      const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
      const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
      return dotProduct / (magnitudeA * magnitudeB);
    }

    console.log('Similarity matrix:');
    console.log('(Values closer to 1.0 indicate higher similarity)\n');

    // Print similarity matrix
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
        console.log(`Text ${i + 1} ↔ Text ${j + 1}: ${similarity.toFixed(4)}`);
        console.log(`  "${multipleTexts[i].substring(0, 30)}..." ↔ "${multipleTexts[j].substring(0, 30)}..."`);
      }
    }
    console.log();

    // 4. Domain-specific embeddings
    console.log('4. Domain-specific Embeddings');
    console.log('='.repeat(40));

    const techTexts = [
      "JavaScript is a programming language for web development.",
      "Python is popular for data science and machine learning.",
      "React is a library for building user interfaces.",
      "The weather is sunny and warm today.",
      "I love eating pizza and pasta.",
    ];

    console.log('Analyzing embeddings for different domains...\n');

    const { embeddings: techEmbeddings } = await embedMany({
      model: embeddingModel,
      values: techTexts,
    });

    // Find most similar pairs
    let maxSimilarity = -1;
    let maxPair = [0, 0];
    let minSimilarity = 1;
    let minPair = [0, 0];

    for (let i = 0; i < techEmbeddings.length; i++) {
      for (let j = i + 1; j < techEmbeddings.length; j++) {
        const similarity = cosineSimilarity(techEmbeddings[i], techEmbeddings[j]);
        
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          maxPair = [i, j];
        }
        
        if (similarity < minSimilarity) {
          minSimilarity = similarity;
          minPair = [i, j];
        }
      }
    }

    console.log(`Most similar pair (${maxSimilarity.toFixed(4)}):`);
    console.log(`  "${techTexts[maxPair[0]]}"`);
    console.log(`  "${techTexts[maxPair[1]]}"\n`);

    console.log(`Least similar pair (${minSimilarity.toFixed(4)}):`);
    console.log(`  "${techTexts[minPair[0]]}"`);
    console.log(`  "${techTexts[minPair[1]]}"\n`);

    // 5. Batch processing performance test
    console.log('5. Batch Processing Performance');
    console.log('='.repeat(40));

    const batchTexts = Array.from({ length: 20 }, (_, i) => 
      `This is test sentence number ${i + 1} for batch processing evaluation.`
    );

    console.log(`Processing ${batchTexts.length} texts in batch...`);
    
    const batchStartTime = Date.now();
    const { embeddings: batchEmbeddings, usage: batchUsage } = await embedMany({
      model: embeddingModel,
      values: batchTexts,
    });
    const batchEndTime = Date.now();

    console.log(`Batch processing completed!`);
    console.log(`Time: ${batchEndTime - batchStartTime}ms`);
    console.log(`Average per text: ${Math.round((batchEndTime - batchStartTime) / batchTexts.length)}ms`);
    console.log(`Total embeddings: ${batchEmbeddings.length}`);
    console.log(`Tokens used: ${batchUsage?.tokens || 'unknown'}\n`);

    // 6. Individual vs Batch comparison
    console.log('6. Individual vs Batch Processing Comparison');
    console.log('='.repeat(40));

    const comparisonTexts = [
      "Compare individual processing",
      "Compare batch processing efficiency", 
      "Compare performance metrics",
    ];

    // Individual processing
    console.log('Testing individual processing...');
    const individualStartTime = Date.now();
    const individualEmbeddings = [];
    
    for (const text of comparisonTexts) {
      const { embedding } = await embed({
        model: embeddingModel,
        value: text,
      });
      individualEmbeddings.push(embedding);
    }
    
    const individualEndTime = Date.now();
    const individualTime = individualEndTime - individualStartTime;

    // Batch processing
    console.log('Testing batch processing...');
    const batchCompStartTime = Date.now();
    const { embeddings: batchCompEmbeddings } = await embedMany({
      model: embeddingModel,
      values: comparisonTexts,
    });
    console.log(`Generated ${batchCompEmbeddings.length} batch embeddings`);
    const batchCompEndTime = Date.now();
    const batchCompTime = batchCompEndTime - batchCompStartTime;

    console.log('\nComparison Results:');
    console.log(`Individual processing: ${individualTime}ms`);
    console.log(`Batch processing: ${batchCompTime}ms`);
    console.log(`Speedup: ${(individualTime / batchCompTime).toFixed(2)}x faster`);
    console.log(`Per-text (individual): ${Math.round(individualTime / comparisonTexts.length)}ms`);
    console.log(`Per-text (batch): ${Math.round(batchCompTime / comparisonTexts.length)}ms`);

    // Enhanced performance analysis
    console.log('\n📊 Enhanced Performance Analysis:');
    const monitorStats = globalToolMonitor.getExecutionStats();
    console.log(`Total operations completed: ${monitorStats.totalCompleted}`);
    console.log(`Success rate: ${(monitorStats.successRate * 100).toFixed(1)}%`);
    console.log(`Average execution time: ${monitorStats.averageDuration.toFixed(0)}ms`);
    console.log('');

    // 7. Embedding analysis utilities
    console.log('7. Embedding Analysis Utilities');
    console.log('='.repeat(40));

    const analysisTexts = [
      "Machine learning algorithms learn from data.",
      "Deep learning uses neural networks with many layers.",
    ];

    const { embeddings: analysisEmbeddings } = await embedMany({
      model: embeddingModel,
      values: analysisTexts,
    });

    // Statistical analysis
    function analyzeEmbedding(embedding: number[], label: string) {
      const sum = embedding.reduce((a, b) => a + b, 0);
      const mean = sum / embedding.length;
      const variance = embedding.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / embedding.length;
      const stdDev = Math.sqrt(variance);
      const min = Math.min(...embedding);
      const max = Math.max(...embedding);

      console.log(`${label}:`);
      console.log(`  Mean: ${mean.toFixed(6)}`);
      console.log(`  Std Dev: ${stdDev.toFixed(6)}`);
      console.log(`  Min: ${min.toFixed(6)}`);
      console.log(`  Max: ${max.toFixed(6)}`);
      console.log(`  Range: ${(max - min).toFixed(6)}`);
    }

    analysisEmbeddings.forEach((embedding, index) => {
      analyzeEmbedding(embedding, `Embedding ${index + 1}`);
    });

    // Summary statistics
    const totalTokens = [usage, multiUsage, batchUsage]
      .filter(u => u?.tokens)
      .reduce((sum, u) => sum + (u?.tokens || 0), 0);

    console.log('\n✅ Enhanced Embedding demo completed successfully!');
    console.log(`Total tokens used: ${totalTokens}`);
    console.log(`Embedding dimensions: ${embedding.length}`);
    console.log('🎯 Enhanced features demonstrated:');
    console.log('- Performance monitoring and analytics');
    console.log('- Batch processing optimization');
    console.log('- Comprehensive error handling');
    console.log('All DUDOXX embedding features are working correctly.\n');

  } catch (error) {
    console.error('❌ Embedding demo failed:', error);
    
    // Enhanced error reporting
    const classification = classifyError(error);
    console.error(`Error type: ${classification.type}`);
    console.error(`Retryable: ${classification.isRetryable}`);
    
    throw error;
  }
}

// Advanced embedding utilities
class EmbeddingAnalyzer {
  static cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  static euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, ai, i) => sum + Math.pow(ai - b[i], 2), 0));
  }

  static findMostSimilar(target: number[], embeddings: number[][]): { index: number; similarity: number } {
    let maxSimilarity = -1;
    let bestIndex = 0;

    embeddings.forEach((embedding, index) => {
      const similarity = this.cosineSimilarity(target, embedding);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestIndex = index;
      }
    });

    return { index: bestIndex, similarity: maxSimilarity };
  }

  static clusterBySimilarity(embeddings: number[][], threshold: number = 0.8): number[][] {
    const clusters: number[][] = [];
    const visited = new Set<number>();

    for (let i = 0; i < embeddings.length; i++) {
      if (visited.has(i)) continue;

      const cluster = [i];
      visited.add(i);

      for (let j = i + 1; j < embeddings.length; j++) {
        if (visited.has(j)) continue;

        const similarity = this.cosineSimilarity(embeddings[i], embeddings[j]);
        if (similarity >= threshold) {
          cluster.push(j);
          visited.add(j);
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  }
}

// Semantic search demo
async function semanticSearchDemo() {
  console.log('\n🔍 Semantic Search Demo');
  console.log('='.repeat(40));

  const dudoxx = createDudoxx({
    baseURL: process.env.DUDOXX_BASE_URL,
    apiKey: process.env.DUDOXX_API_KEY,
  });

  const embeddingModel = dudoxx.embedding(process.env.DUDOXX_EMBEDDING_MODEL_NAME || 'embedder');

  // Knowledge base
  const documents = [
    "Python is a high-level programming language known for its simplicity and readability.",
    "JavaScript is the programming language of the web, used for both frontend and backend development.",
    "Machine learning is a subset of artificial intelligence that learns patterns from data.",
    "React is a JavaScript library for building user interfaces, particularly web applications.",
    "Neural networks are computing systems inspired by biological neural networks.",
    "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.",
    "Deep learning uses neural networks with many layers to model complex patterns.",
    "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.",
  ];

  console.log('Building knowledge base embeddings...');
  const { embeddings: docEmbeddings } = await embedMany({
    model: embeddingModel,
    values: documents,
  });

  // Search queries
  const queries = [
    "What is machine learning?",
    "Tell me about JavaScript frameworks",
    "How do neural networks work?",
  ];

  console.log('\nPerforming semantic searches:\n');

  for (const query of queries) {
    console.log(`Query: "${query}"`);
    
    const { embedding: queryEmbedding } = await embed({
      model: embeddingModel,
      value: query,
    });

    const results = EmbeddingAnalyzer.findMostSimilar(queryEmbedding, docEmbeddings);
    
    console.log(`Best match (${results.similarity.toFixed(4)}): "${documents[results.index]}"`);
    console.log();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  async function runDemo() {
    await embedDemo();
    await semanticSearchDemo();
  }
  
  runDemo();
}

export { embedDemo, EmbeddingAnalyzer };