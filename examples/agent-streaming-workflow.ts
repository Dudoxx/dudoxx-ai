#!/usr/bin/env tsx

/**
 * AI Agent Streaming Workflow Example
 * Demonstrates intelligent multi-step problem solving with real-time streaming
 * Combines generateText for tool execution + streamText for live response delivery
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateText, streamText, tool } from 'ai';
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

// Enhanced Research Tool with streaming-friendly output
const researchTool = tool({
  description: 'Research comprehensive information about a specific topic with detailed findings',
  parameters: z.object({
    topic: z.string().describe('The topic or question to research'),
    focus: z.string().optional().describe('Specific aspect to focus on'),
    depth: z.enum(['quick', 'detailed', 'comprehensive']).default('detailed').describe('Research depth level'),
  }),
  execute: async ({ topic, focus, depth }) => {
    const baseDelay = depth === 'quick' ? 800 : depth === 'detailed' ? 1200 : 1800;
    await new Promise(resolve => setTimeout(resolve, baseDelay + Math.random() * 600));
    
    toolExecutionCount++;
    const timestamp = new Date().toISOString();
    
    console.log(`🔍 RESEARCH TOOL EXECUTED: ${topic} ${focus ? `(Focus: ${focus})` : ''} [${depth}] (#${toolExecutionCount})`);
    
    const researchData = {
      topic,
      focus,
      depth,
      keyFindings: [
        'Market shows 40% YoY growth with strong consumer demand',
        'AI adoption rates have tripled in the past 18 months',
        'Major tech companies investing $50B+ annually in AI infrastructure',
        'Regulatory frameworks becoming more defined and supportive',
        'Consumer trust in AI-powered solutions reaching 75%',
        'Enterprise adoption accelerating across all sectors',
      ].slice(0, depth === 'quick' ? 2 : depth === 'detailed' ? 4 : 6),
      marketSize: depth === 'comprehensive' ? '$847 billion by 2030' : depth === 'detailed' ? '$500B+ projected' : 'Rapidly growing',
      trends: [
        'Personalization algorithms becoming more sophisticated',
        'Real-time decision making capabilities expanding',
        'Integration with IoT and edge computing',
        'Focus on ethical AI and transparency',
      ].slice(0, depth === 'quick' ? 2 : 3),
      risks: ['Competition intensity', 'Technology complexity', 'Regulatory changes'],
      opportunities: ['First-mover advantage', 'Market consolidation', 'Partnership potential'],
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      sources: [
        'McKinsey Global AI Report 2024',
        'Gartner Technology Trends',
        'Industry Expert Interviews',
        'Market Research Database',
      ],
      lastUpdated: timestamp,
    };
    
    executionLog.push({
      step: toolExecutionCount,
      tool: 'research',
      args: { topic, focus, depth },
      result: researchData,
      timestamp,
    });
    
    return researchData;
  },
});

// Strategic Analysis Tool with comprehensive insights
const strategicAnalysisTool = tool({
  description: 'Perform strategic analysis with detailed insights and recommendations',
  parameters: z.object({
    context: z.string().describe('Business context and background information'),
    analysisType: z.enum(['swot', 'competitive', 'financial', 'risk', 'market-entry']).describe('Type of strategic analysis'),
    timeHorizon: z.enum(['short-term', 'medium-term', 'long-term']).default('medium-term').describe('Analysis time horizon'),
    criteria: z.array(z.string()).optional().describe('Specific evaluation criteria'),
  }),
  execute: async ({ context, analysisType, timeHorizon, criteria }) => {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    toolExecutionCount++;
    const timestamp = new Date().toISOString();
    
    console.log(`📊 STRATEGIC ANALYSIS EXECUTED: ${analysisType} analysis (${timeHorizon}) (#${toolExecutionCount})`);
    
    const analysisResult = {
      analysisType,
      timeHorizon,
      context,
      executiveSummary: `Strategic ${analysisType} analysis reveals strong market position with significant growth opportunities`,
      strengths: [
        'Strong technical capabilities and innovation pipeline',
        'Experienced leadership team with proven track record',
        'Access to cutting-edge AI technologies',
        'Strategic partnerships with key industry players',
      ].slice(0, 2 + Math.floor(Math.random() * 3)),
      weaknesses: [
        'Limited brand recognition in target market',
        'Resource constraints for rapid scaling',
        'Dependency on external technology providers',
      ].slice(0, 1 + Math.floor(Math.random() * 2)),
      opportunities: [
        'Underserved market segments with high demand',
        'Potential for strategic acquisitions',
        'Government incentives for AI innovation',
        'Platform integration possibilities',
      ].slice(0, 2 + Math.floor(Math.random() * 3)),
      threats: [
        'Intense competition from established players',
        'Regulatory uncertainties',
        'Technology disruption risks',
        'Economic market volatility',
      ].slice(0, 2 + Math.floor(Math.random() * 2)),
      keyMetrics: {
        marketPotential: Math.floor(Math.random() * 40) + 60 + '%', // 60-100%
        competitiveAdvantage: Math.floor(Math.random() * 30) + 70 + '%', // 70-100%
        riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        investmentRequired: '$' + (Math.floor(Math.random() * 80) + 20) + 'M',
      },
      recommendations: [
        'Focus on rapid market entry to capture first-mover advantage',
        'Develop strategic partnerships to accelerate growth',
        'Invest in brand building and market education',
        'Implement robust risk management frameworks',
      ].slice(0, 2 + Math.floor(Math.random() * 3)),
      nextSteps: [
        'Conduct detailed market validation studies',
        'Secure strategic partnerships',
        'Develop minimum viable product',
        'Prepare investor presentations',
      ],
      confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
      criteria: criteria || ['profitability', 'market-fit', 'scalability', 'risk-assessment'],
      timestamp,
    };
    
    executionLog.push({
      step: toolExecutionCount,
      tool: 'strategic-analysis',
      args: { context, analysisType, timeHorizon, criteria },
      result: analysisResult,
      timestamp,
    });
    
    return analysisResult;
  },
});

// Investment Decision Tool with detailed evaluation
const investmentDecisionTool = tool({
  description: 'Make investment decisions with detailed financial and strategic evaluation',
  parameters: z.object({
    opportunity: z.string().describe('Investment opportunity description'),
    investmentAmount: z.string().describe('Required investment amount'),
    timeframe: z.string().describe('Investment timeframe'),
    riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).describe('Risk tolerance level'),
    criteria: z.array(z.string()).describe('Decision criteria to evaluate'),
  }),
  execute: async ({ opportunity, investmentAmount, timeframe, riskTolerance, criteria }) => {
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
    
    toolExecutionCount++;
    const timestamp = new Date().toISOString();
    
    console.log(`🎯 INVESTMENT DECISION EXECUTED: ${opportunity} - ${investmentAmount} (${riskTolerance}) (#${toolExecutionCount})`);
    
    // Simulate financial calculations
    const baseROI = riskTolerance === 'conservative' ? 15 : riskTolerance === 'moderate' ? 25 : 40;
    const projectedROI = baseROI + Math.floor(Math.random() * 20);
    const successProbability = riskTolerance === 'conservative' ? 85 : riskTolerance === 'moderate' ? 70 : 55;
    
    const decision = {
      opportunity,
      investmentAmount,
      timeframe,
      riskTolerance,
      recommendation: projectedROI > 20 && successProbability > 60 ? 'INVEST' : projectedROI > 15 ? 'CONDITIONAL' : 'PASS',
      confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
      financialProjections: {
        projectedROI: projectedROI + '%',
        breakEvenPoint: Math.floor(Math.random() * 24) + 12 + ' months',
        totalReturn: '$' + Math.floor(parseInt(investmentAmount.replace(/[^\d]/g, '')) * (1 + projectedROI/100)) + 'M',
        riskAdjustedReturn: (projectedROI * successProbability/100).toFixed(1) + '%',
      },
      riskAssessment: {
        successProbability: successProbability + '%',
        majorRisks: [
          'Market timing and adoption rates',
          'Competitive response and market share erosion',
          'Technology execution and scalability challenges',
          'Regulatory changes and compliance costs',
        ].slice(0, 2 + Math.floor(Math.random() * 3)),
        mitigationStrategies: [
          'Phased investment approach with milestone gates',
          'Strategic partnerships to reduce execution risk',
          'Diversified revenue stream development',
          'Continuous market monitoring and adaptation',
        ].slice(0, 2 + Math.floor(Math.random() * 3)),
      },
      strategicFit: {
        alignmentScore: Math.floor(Math.random() * 30) + 70 + '%', // 70-100%
        strategicBenefits: [
          'Market leadership position in growing sector',
          'Technology platform for future expansion',
          'Brand strengthening and market credibility',
          'Access to new customer segments',
        ].slice(0, 2 + Math.floor(Math.random() * 3)),
      },
      conditions: projectedROI > 15 && projectedROI <= 20 ? [
        'Secure strategic partnership within 6 months',
        'Achieve product-market fit validation',
        'Reduce capital requirements by 25%',
        'Establish clear exit strategy',
      ] : [],
      nextSteps: [
        'Conduct detailed due diligence',
        'Negotiate investment terms',
        'Develop implementation timeline',
        'Establish governance structure',
      ],
      criteria,
      timestamp,
    };
    
    executionLog.push({
      step: toolExecutionCount,
      tool: 'investment-decision',
      args: { opportunity, investmentAmount, timeframe, riskTolerance, criteria },
      result: decision,
      timestamp,
    });
    
    return decision;
  },
});

// Implementation Planning Tool with detailed roadmap
const implementationPlanTool = tool({
  description: 'Create comprehensive implementation plans with detailed roadmaps and resource allocation',
  parameters: z.object({
    project: z.string().describe('Project or initiative name'),
    scope: z.string().describe('Project scope and objectives'),
    timeline: z.string().describe('Overall timeline'),
    budget: z.string().describe('Available budget'),
    resources: z.array(z.string()).describe('Available resources and team'),
    constraints: z.array(z.string()).optional().describe('Known constraints'),
  }),
  execute: async ({ project, scope, timeline, budget, resources, constraints }) => {
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1200));
    
    toolExecutionCount++;
    const timestamp = new Date().toISOString();
    
    console.log(`📋 IMPLEMENTATION PLAN EXECUTED: ${project} (${timeline}, ${budget}) (#${toolExecutionCount})`);
    
    const phases = [
      {
        name: 'Foundation & Planning',
        duration: '6-8 weeks',
        objectives: ['Market validation', 'Team building', 'Technology architecture'],
        deliverables: ['Business plan', 'Technical specifications', 'Go-to-market strategy'],
        resources: ['Product manager', 'Technical architect', 'Market analyst'],
        budget: '15% of total budget',
      },
      {
        name: 'Development & Testing',
        duration: '12-16 weeks',
        objectives: ['MVP development', 'Quality assurance', 'User testing'],
        deliverables: ['Working prototype', 'Test results', 'User feedback report'],
        resources: ['Development team', 'QA engineers', 'UX designers'],
        budget: '40% of total budget',
      },
      {
        name: 'Launch & Scale',
        duration: '8-12 weeks',
        objectives: ['Market launch', 'Customer acquisition', 'Performance optimization'],
        deliverables: ['Production platform', 'Marketing campaigns', 'Success metrics'],
        resources: ['Marketing team', 'Sales team', 'Customer support'],
        budget: '30% of total budget',
      },
      {
        name: 'Growth & Optimization',
        duration: 'Ongoing',
        objectives: ['Market expansion', 'Feature enhancement', 'Scale optimization'],
        deliverables: ['Growth metrics', 'Enhanced features', 'Market presence'],
        resources: ['Full team', 'Growth specialists', 'Data analysts'],
        budget: '15% of total budget',
      },
    ];
    
    const implementationPlan = {
      project,
      scope,
      timeline,
      budget,
      overview: `Comprehensive implementation plan for ${project} over ${timeline} timeframe`,
      phases: phases.slice(0, 3 + Math.floor(Math.random() * 2)),
      resources,
      constraints: constraints || ['Budget limitations', 'Market timing', 'Technical complexity'],
      riskManagement: {
        criticalRisks: [
          'Technology development delays',
          'Market competition intensification',
          'Resource availability constraints',
          'Regulatory compliance challenges',
        ],
        mitigationPlans: [
          'Agile development with regular milestones',
          'Competitive analysis and rapid response capability',
          'Resource contingency planning and partnerships',
          'Early regulatory engagement and compliance planning',
        ],
      },
      successMetrics: [
        'Time to market achievement',
        'Budget adherence within 10%',
        'Quality targets and user satisfaction',
        'Market penetration and revenue goals',
      ],
      governance: {
        structure: 'Executive steering committee with monthly reviews',
        reporting: 'Weekly progress reports and monthly board updates',
        decisionMaking: 'Collaborative with clear escalation paths',
      },
      contingencyPlans: [
        'Alternative technology approaches',
        'Market pivot strategies',
        'Resource reallocation options',
        'Timeline acceleration/deceleration plans',
      ],
      estimatedROI: Math.floor(Math.random() * 150) + 100 + '%', // 100-250%
      keyMilestones: [
        'Phase 1 completion and go/no-go decision',
        'MVP launch and initial user feedback',
        'Market validation and product-market fit',
        'Scale-up decision and growth acceleration',
      ],
      timestamp,
    };
    
    executionLog.push({
      step: toolExecutionCount,
      tool: 'implementation-plan',
      args: { project, scope, timeline, budget, resources, constraints },
      result: implementationPlan,
      timestamp,
    });
    
    return implementationPlan;
  },
});

async function runStreamingAgentWorkflow() {
  console.log('🤖 AI Agent Streaming Workflow Demo - DUDOXX Provider\n');
  
  console.log('Environment check:');
  console.log(`- DUDOXX_API_KEY: ${process.env.DUDOXX_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- DUDOXX_BASE_URL: ${process.env.DUDOXX_BASE_URL || '❌ Missing'}`);
  console.log('');

  try {
    console.log('🎯 Agent Mission: Evaluate and plan launch of AI-powered healthcare platform');
    console.log('📋 Strategy: Tool execution + Real-time streaming response');
    console.log('🔧 Available Tools: research, strategic-analysis, investment-decision, implementation-plan\n');
    
    const startTime = Date.now();
    
    // Step 1: Execute tools with generateText for comprehensive analysis
    console.log('🔄 Phase 1: Executing comprehensive analysis with tools...\n');
    
    const toolResult = await generateText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
        temperature: 0.7,
      }),
      maxTokens: 2500,
      tools: {
        research: researchTool,
        strategicAnalysis: strategicAnalysisTool,
        investmentDecision: investmentDecisionTool,
        implementationPlan: implementationPlanTool,
      },
      maxSteps: 6, // Allow comprehensive multi-step analysis
      messages: [
        {
          role: 'system',
          content: `You are an expert business consultant and investment advisor specializing in healthcare technology ventures.

Your approach is methodical and thorough:
1. Research the healthcare AI market comprehensively
2. Perform strategic analysis of the opportunity
3. Make an informed investment decision
4. Create a detailed implementation plan if recommended

Use your tools systematically to provide data-driven insights and recommendations. Be thorough in your analysis and consider all relevant factors including market dynamics, competition, risks, and opportunities.`,
        },
        {
          role: 'user',
          content: `I'm considering launching an AI-powered healthcare platform that uses machine learning for:
- Early disease detection through medical imaging analysis
- Personalized treatment recommendations
- Clinical workflow optimization
- Patient monitoring and predictive analytics

This would be a $50M investment over 3 years targeting hospitals and healthcare systems. The market opportunity appears significant but competition is intense.

Please provide a comprehensive evaluation including:
1. Market research on AI healthcare opportunities
2. Strategic analysis of this specific opportunity
3. Investment decision with detailed financial projections
4. Implementation plan if you recommend proceeding

Use all your analytical tools to give me a thorough assessment.`,
        },
      ],
    });

    const toolExecutionTime = Date.now() - startTime;
    
    console.log('\n✅ Tool execution phase completed!');
    console.log(`⏱️  Tool execution time: ${toolExecutionTime}ms (${(toolExecutionTime / 1000).toFixed(1)}s)`);
    console.log(`🔧 Tools executed: ${toolExecutionCount}`);
    console.log(`📝 Analysis steps: ${toolResult.steps.length}`);
    console.log(`🔢 Tokens used: ${toolResult.usage.totalTokens}\n`);
    
    // Show tool execution summary
    console.log('🔧 Tool Execution Summary:');
    console.log('─'.repeat(50));
    executionLog.forEach((entry, index) => {
      const duration = index > 0 ? 
        new Date(entry.timestamp).getTime() - new Date(executionLog[index - 1].timestamp).getTime() 
        : 0;
      console.log(`${index + 1}. ${entry.tool.toUpperCase()}`);
      console.log(`   ${JSON.stringify(entry.args).substring(0, 80)}...`);
      console.log(`   ⏱️  ${duration > 0 ? duration + 'ms' : 'Initial'} | ${new Date(entry.timestamp).toLocaleTimeString()}`);
    });
    
    // Step 2: Stream detailed recommendations and insights
    console.log('\n🔄 Phase 2: Streaming executive summary and recommendations...\n');
    
    const streamStartTime = Date.now();
    
    const streamResult = await streamText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
        temperature: 0.8, // Higher creativity for engaging presentation
      }),
      maxTokens: 1500,
      messages: [
        {
          role: 'system',
          content: `You are presenting the results of a comprehensive business analysis to senior executives and investors.

Your presentation style should be:
- Executive-level, confident, and decisive
- Data-driven with specific metrics and insights
- Action-oriented with clear next steps
- Professional yet engaging
- Include specific numbers, timelines, and recommendations

Structure your response as an executive briefing with clear sections and compelling insights.`,
        },
        {
          role: 'user',
          content: `Based on this comprehensive analysis: "${toolResult.text}"

Please provide a streaming executive briefing that includes:

1. **Executive Summary** - Key findings and recommendation
2. **Market Opportunity** - Size, growth, and positioning
3. **Strategic Assessment** - Strengths, risks, and competitive advantage
4. **Financial Projections** - Investment returns and timeline
5. **Implementation Roadmap** - Key phases and milestones
6. **Risk Management** - Critical risks and mitigation strategies
7. **Recommendation** - Clear go/no-go decision with rationale

Present this as if you're briefing the board of directors. Be confident, specific, and actionable.`,
        },
      ],
    });

    console.log('🎙️  Executive Briefing - Live Streaming:');
    console.log('═'.repeat(80));

    let streamedText = '';
    let charCount = 0;

    for await (const delta of streamResult.textStream) {
      process.stdout.write(delta);
      streamedText += delta;
      charCount += delta.length;
    }

    const streamingTime = Date.now() - streamStartTime;
    const totalTime = Date.now() - startTime;

    console.log('\n═'.repeat(80));
    console.log(`📊 Streamed ${charCount} characters in ${streamingTime}ms (${(streamingTime / 1000).toFixed(1)}s)\n`);

    // Final comprehensive summary
    console.log('📊 Complete Workflow Performance:');
    console.log('═'.repeat(80));
    console.log(`⏱️  Total execution time: ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`);
    console.log(`🔧 Tool executions: ${toolExecutionCount}`);
    console.log(`📝 Analysis phases: 2 (Tools + Streaming)`);
    console.log(`🔢 Total tokens (tools): ${toolResult.usage.totalTokens}`);
    console.log(`🌊 Streaming characters: ${charCount}`);
    console.log(`📈 Performance: Tool analysis + Live executive briefing`);

    // Tool usage breakdown
    console.log('\n🔧 Tool Usage Analysis:');
    console.log('─'.repeat(40));
    const toolUsage = executionLog.reduce((acc, entry) => {
      acc[entry.tool] = (acc[entry.tool] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(toolUsage).forEach(([tool, count]) => {
      console.log(`📊 ${tool.replace('-', ' ')}: ${count} execution${count > 1 ? 's' : ''}`);
    });

    // Performance insights
    console.log('\n🔍 Workflow Performance Insights:');
    console.log('─'.repeat(40));
    if (toolExecutionCount >= 4) {
      console.log('✅ Comprehensive multi-tool analysis completed');
    }
    if (Object.keys(toolUsage).length >= 3) {
      console.log('✅ Systematic use of specialized analytical tools');
    }
    if (charCount > 1000) {
      console.log('✅ Detailed executive-level streaming presentation');
    }
    
    const avgToolTime = toolExecutionTime / Math.max(toolExecutionCount, 1);
    console.log(`⚡ Average tool execution time: ${avgToolTime.toFixed(0)}ms`);
    console.log(`🚀 Streaming rate: ${(charCount / streamingTime * 1000).toFixed(0)} chars/second`);

    console.log('\n✅ AI Agent Streaming Workflow completed successfully!');
    console.log('🎯 Demonstrated: Comprehensive analysis + Real-time executive presentation');
    console.log('🚀 DUDOXX provider: Optimal for complex business intelligence workflows');

  } catch (error) {
    console.error('❌ Streaming agent workflow failed:', error);
    
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

runStreamingAgentWorkflow();