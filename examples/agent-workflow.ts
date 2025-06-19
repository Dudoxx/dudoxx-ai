#!/usr/bin/env tsx

/**
 * AI Agent Workflow Example
 * Demonstrates intelligent multi-step problem solving using DUDOXX provider
 * Based on AI SDK agent concepts: https://ai-sdk.dev/docs/foundations/agents
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { dudoxx } from '../src/index';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

// Global execution tracking
let toolExecutionCount = 0;
const executionLog: Array<{ step: number; tool: string; args: any; result: any; timestamp: string }> = [];

// Research Tool - Simulates web research capabilities
const researchTool = tool({
  description: 'Research information about a specific topic or question',
  parameters: z.object({
    topic: z.string().describe('The topic or question to research'),
    focus: z.string().optional().describe('Specific aspect to focus on'),
  }),
  execute: async ({ topic, focus }) => {
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
    
    toolExecutionCount++;
    const timestamp = new Date().toISOString();
    
    console.log(`🔍 RESEARCH TOOL EXECUTED: ${topic} ${focus ? `(Focus: ${focus})` : ''} (#${toolExecutionCount})`);
    
    // Simulate research results with realistic data
    const researchData = {
      topic,
      focus,
      findings: [
        'Recent market trends show significant growth',
        'Key industry players are investing heavily',
        'Consumer adoption rates are accelerating',
        'Regulatory landscape is becoming clearer',
      ].slice(0, 2 + Math.floor(Math.random() * 3)),
      sources: ['Industry Report 2024', 'Market Analysis Q1', 'Expert Interview'],
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      lastUpdated: timestamp,
    };
    
    executionLog.push({
      step: toolExecutionCount,
      tool: 'research',
      args: { topic, focus },
      result: researchData,
      timestamp,
    });
    
    return researchData;
  },
});

// Analysis Tool - Processes and analyzes data
const analysisTool = tool({
  description: 'Analyze data and provide insights with recommendations',
  parameters: z.object({
    data: z.string().describe('Data or information to analyze'),
    analysisType: z.enum(['financial', 'market', 'technical', 'strategic']).describe('Type of analysis to perform'),
    criteria: z.array(z.string()).optional().describe('Specific criteria to evaluate'),
  }),
  execute: async ({ data, analysisType, criteria }) => {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    toolExecutionCount++;
    const timestamp = new Date().toISOString();
    
    console.log(`📊 ANALYSIS TOOL EXECUTED: ${analysisType} analysis (#${toolExecutionCount})`);
    
    const analysisResult = {
      analysisType,
      summary: `Comprehensive ${analysisType} analysis completed`,
      insights: [
        'Strong positive indicators identified',
        'Risk factors are within acceptable range',
        'Growth potential is significant',
        'Market positioning is favorable',
      ].slice(0, 2 + Math.floor(Math.random() * 3)),
      recommendations: [
        'Consider strategic investment',
        'Monitor key performance indicators',
        'Develop risk mitigation strategies',
        'Expand market presence',
      ].slice(0, 2 + Math.floor(Math.random() * 3)),
      score: Math.floor(Math.random() * 30) + 70, // 70-100
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      criteria: criteria || ['performance', 'risk', 'growth'],
      timestamp,
    };
    
    executionLog.push({
      step: toolExecutionCount,
      tool: 'analysis',
      args: { data, analysisType, criteria },
      result: analysisResult,
      timestamp,
    });
    
    return analysisResult;
  },
});

// Decision Tool - Makes recommendations based on analysis
const decisionTool = tool({
  description: 'Make strategic decisions based on research and analysis',
  parameters: z.object({
    context: z.string().describe('Context and background information'),
    options: z.array(z.string()).describe('Available options to choose from'),
    decisionCriteria: z.array(z.string()).describe('Criteria for making the decision'),
  }),
  execute: async ({ context, options, decisionCriteria }) => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 600));
    
    toolExecutionCount++;
    const timestamp = new Date().toISOString();
    
    console.log(`🎯 DECISION TOOL EXECUTED: Evaluating ${options.length} options (#${toolExecutionCount})`);
    
    const decision = {
      context,
      evaluatedOptions: options.map((option, index) => ({
        option,
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        pros: ['Strong potential', 'Good market fit', 'Feasible implementation'].slice(0, 2),
        cons: ['Some risks identified', 'Resource requirements'].slice(0, 1 + Math.floor(Math.random() * 2)),
      })),
      recommendedOption: options[Math.floor(Math.random() * options.length)],
      reasoning: 'Based on comprehensive analysis of all factors',
      confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
      nextSteps: [
        'Develop detailed implementation plan',
        'Conduct stakeholder review',
        'Prepare resource allocation',
        'Set success metrics',
      ].slice(0, 2 + Math.floor(Math.random() * 3)),
      decisionCriteria,
      timestamp,
    };
    
    executionLog.push({
      step: toolExecutionCount,
      tool: 'decision',
      args: { context, options, decisionCriteria },
      result: decision,
      timestamp,
    });
    
    return decision;
  },
});

// Planning Tool - Creates action plans
const planningTool = tool({
  description: 'Create detailed action plans with timelines and milestones',
  parameters: z.object({
    objective: z.string().describe('Main objective or goal'),
    timeline: z.string().describe('Desired timeline (e.g., "3 months", "Q2 2024")'),
    resources: z.array(z.string()).describe('Available resources'),
    constraints: z.array(z.string()).optional().describe('Known constraints or limitations'),
  }),
  execute: async ({ objective, timeline, resources, constraints }) => {
    await new Promise(resolve => setTimeout(resolve, 1800 + Math.random() * 1200));
    
    toolExecutionCount++;
    const timestamp = new Date().toISOString();
    
    console.log(`📋 PLANNING TOOL EXECUTED: ${objective} (${timeline}) (#${toolExecutionCount})`);
    
    const phases = [
      { name: 'Planning & Preparation', duration: '2-3 weeks', activities: ['Research', 'Design', 'Resource allocation'] },
      { name: 'Implementation Phase 1', duration: '4-6 weeks', activities: ['Development', 'Testing', 'Initial deployment'] },
      { name: 'Optimization & Scaling', duration: '3-4 weeks', activities: ['Performance tuning', 'User feedback', 'Scaling preparation'] },
      { name: 'Launch & Monitoring', duration: '2 weeks', activities: ['Final deployment', 'Monitoring setup', 'Success measurement'] },
    ];
    
    const actionPlan = {
      objective,
      timeline,
      phases: phases.slice(0, 2 + Math.floor(Math.random() * 3)),
      resources,
      constraints: constraints || ['Budget limitations', 'Time constraints'],
      risks: ['Technical challenges', 'Resource availability', 'Market changes'],
      successMetrics: ['Performance indicators', 'User adoption', 'ROI achievement'],
      milestones: [
        'Phase 1 completion',
        'Beta testing results',
        'Go-live date',
        'Success criteria met',
      ].slice(0, 2 + Math.floor(Math.random() * 3)),
      estimatedBudget: '$' + (Math.floor(Math.random() * 50) + 25) + 'K',
      timestamp,
    };
    
    executionLog.push({
      step: toolExecutionCount,
      tool: 'planning',
      args: { objective, timeline, resources, constraints },
      result: actionPlan,
      timestamp,
    });
    
    return actionPlan;
  },
});

async function runAgentWorkflow() {
  console.log('🤖 AI Agent Workflow Demo - DUDOXX Provider\n');
  
  console.log('Environment check:');
  console.log(`- DUDOXX_API_KEY: ${process.env.DUDOXX_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- DUDOXX_BASE_URL: ${process.env.DUDOXX_BASE_URL || '❌ Missing'}`);
  console.log('');

  try {
    console.log('🎯 Agent Mission: Evaluate a new AI-powered e-commerce platform');
    console.log('📋 Agent Capabilities: Research, Analysis, Decision Making, Planning');
    console.log('🔧 Available Tools: research, analysis, decision, planning\n');
    
    const startTime = Date.now();
    
    // Agent workflow with multi-step problem solving
    const result = await generateText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
        temperature: 0.8, // Higher creativity for agent reasoning
      }),
      maxTokens: 2000,
      tools: {
        research: researchTool,
        analyze: analysisTool,
        decide: decisionTool,
        plan: planningTool,
      },
      maxSteps: 8, // Allow complex multi-step reasoning
      messages: [
        {
          role: 'system',
          content: `You are an intelligent business consultant agent with access to research, analysis, decision-making, and planning tools.

Your role is to:
1. Break down complex business problems into manageable steps
2. Use tools systematically to gather information and insights
3. Reason through problems step-by-step
4. Provide comprehensive recommendations with actionable plans

When working on a task:
- Start by researching the topic thoroughly
- Analyze the gathered information from multiple angles
- Make informed decisions based on your analysis
- Create detailed action plans for implementation

Be methodical, thorough, and provide clear reasoning for each step you take.`,
        },
        {
          role: 'user',
          content: `I'm considering launching a new AI-powered e-commerce platform that uses machine learning to personalize shopping experiences. The platform would compete with major players like Amazon and Shopify.

Please evaluate this business opportunity by:
1. Researching the AI e-commerce market and trends
2. Analyzing the competitive landscape and market potential
3. Making a go/no-go decision with clear reasoning
4. If positive, create a comprehensive launch plan

Use your tools systematically and provide detailed insights at each step. I need a thorough evaluation to make an informed investment decision.`,
        },
      ],
    });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log('\n\n🎯 Agent Workflow Completed!\n');
    console.log('═'.repeat(80));
    
    // Display execution summary
    console.log('\n📊 Execution Summary:');
    console.log('─'.repeat(40));
    console.log(`⏱️  Total execution time: ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`);
    console.log(`🔧 Tool executions: ${toolExecutionCount}`);
    console.log(`📝 Steps completed: ${result.steps.length}`);
    console.log(`🔢 Total tokens used: ${result.usage.totalTokens}`);
    console.log(`🔢 Prompt tokens: ${result.usage.promptTokens}`);
    console.log(`🔢 Completion tokens: ${result.usage.completionTokens}`);

    // Display tool execution log
    console.log('\n🔧 Tool Execution Log:');
    console.log('─'.repeat(40));
    executionLog.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.tool.toUpperCase()} - ${JSON.stringify(entry.args).substring(0, 80)}...`);
      console.log(`   Result: ${entry.result.summary || entry.result.topic || entry.result.objective || 'Completed'}`);
      console.log(`   Time: ${new Date(entry.timestamp).toLocaleTimeString()}\n`);
    });

    // Display agent's final response
    console.log('🤖 Agent Final Report:');
    console.log('═'.repeat(80));
    console.log(result.text);
    console.log('═'.repeat(80));

    // Analysis of agent behavior
    console.log('\n🔍 Agent Performance Analysis:');
    console.log('─'.repeat(40));
    
    const toolUsage = executionLog.reduce((acc, entry) => {
      acc[entry.tool] = (acc[entry.tool] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(toolUsage).forEach(([tool, count]) => {
      console.log(`📊 ${tool}: ${count} execution${count > 1 ? 's' : ''}`);
    });

    if (toolExecutionCount >= 3) {
      console.log('✅ Agent demonstrated multi-step reasoning');
    }
    
    if (Object.keys(toolUsage).length >= 3) {
      console.log('✅ Agent used multiple tools systematically');
    }
    
    const avgStepTime = totalTime / Math.max(toolExecutionCount, 1);
    console.log(`⚡ Average tool execution time: ${avgStepTime.toFixed(0)}ms`);

    console.log('\n✅ AI Agent workflow completed successfully!');
    console.log('🚀 DUDOXX provider demonstrated intelligent multi-step problem solving');

  } catch (error) {
    console.error('❌ Agent workflow failed:', error);
    
    if (error instanceof Error) {
      console.log('\n🔍 Error Analysis:');
      if (error.message.includes('API key')) {
        console.log('- Issue: API key problem');
        console.log('- Solution: Check DUDOXX_API_KEY in .env.local');
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        console.log('- Issue: Network/connection problem');
        console.log('- Solution: Check internet connection and DUDOXX_BASE_URL');
      }
      if (error.message.includes('tool')) {
        console.log('- Issue: Tool execution problem');
        console.log('- Solution: Check tool definitions and parameters');
      }
    }
    
    throw error;
  }
}

runAgentWorkflow();