"use client";

import { useState } from "react";
import { CheckCircle, Circle, AlertTriangle, Users, Calendar, Target } from "lucide-react";

type Task = { name: string; completed: boolean; details: string };
type TasksByKey = Record<string, Task>;
type WorkPackageStatus = "not-started" | "in-progress" | "complete" | "issue";
type WorkPackage = {
  name: string;
  timeline: string;
  responsible: string;
  status: WorkPackageStatus;
  progress: number;
  tasks: TasksByKey;
  qualityGate: { name: string; passed: boolean | null };
  contingency: string;
};
type WorkPackages = Record<string, WorkPackage>;
type RiskStatus = "active" | "monitoring" | "resolved" | string;
type Risk = { id: number; name: string; probability: string; impact: string; status: RiskStatus };
type Workload = "high" | "medium" | "low" | string;
type TeamMember = { name: string; fte: number; currentTasks: number; workload: Workload };
type ProjectData = { workPackages: WorkPackages; risks: Risk[]; teamMembers: TeamMember[] };

const ProjectDashboard = () => {
	// State for tracking project progress
	const [projectData, setProjectData] = useState<ProjectData>({
		workPackages: {
			wp1: {
				name: "Surface-Subsurface Analysis",
				timeline: "Months 1-6",
				responsible: "Primary Researcher + Technical Support",
				status: "not-started",
				progress: 0,
				tasks: {
					month1: { name: "Data Acquisition & Infrastructure", completed: false, details: "Database setup, quality control, software environment" },
					month23: { name: "Statistical Analysis & Correlation", completed: false, details: "Correlation analysis, seasonal patterns, time lag analysis" },
					month46: { name: "ML Model Development", completed: false, details: "Random Forest models, validation, uncertainty quantification" }
				},
				qualityGate: { name: "Surface-subsurface correlation >0.50 at >7 stations", passed: null },
				contingency: "Focus on 20-30cm depth if R² <0.30"
			},
			wp2: {
				name: "Satellite Integration",
				timeline: "Months 6-10",
				responsible: "Remote Sensing Specialist + Primary Researcher",
				status: "not-started",
				progress: 0,
				tasks: {
					month67: { name: "Satellite Data Processing", completed: false, details: "SMAP data acquisition, quality assessment, alignment" },
					month89: { name: "Calibration Development", completed: false, details: "Linear/non-linear calibration, seasonal stability" },
					month10: { name: "Integration Assessment", completed: false, details: "Performance evaluation, methodology adjustment" }
				},
				qualityGate: { name: "Satellite-ground correlation >0.40", passed: null },
				contingency: "Alternative spatial interpolation with ground data only"
			},
			wp3: {
				name: "Spatial Prediction Development",
				timeline: "Months 8-11",
				responsible: "Primary Researcher + ML Specialist",
				status: "not-started",
				progress: 0,
				tasks: {
					month89: { name: "Spatial Extension Methodology", completed: false, details: "Distance-based weighting, soil property integration" },
					month1011: { name: "Uncertainty Quantification", completed: false, details: "Spatial uncertainty mapping, quality flagging" }
				},
				qualityGate: { name: "Cross-station R² >0.40 within 5km", passed: null },
				contingency: "Focus on 3km radius, document limitations"
			},
			wp4: {
				name: "Agricultural Validation",
				timeline: "Months 10-12",
				responsible: "Agricultural Expert + Full Team",
				status: "not-started",
				progress: 0,
				tasks: {
					month10: { name: "Agricultural Data Integration", completed: false, details: "Biomass proxy data, drought index development" },
					month11: { name: "Validation Analysis", completed: false, details: "Biomass correlation, drought event detection" },
					month12: { name: "Final Assessment", completed: false, details: "Performance evaluation, documentation, technology transfer" }
				},
				qualityGate: { name: "Biomass correlation R < -0.30", passed: null },
				contingency: "Focus on technical validation if agricultural proves complex"
			}
		},
		risks: [
			{ id: 1, name: "Insufficient Surface-Subsurface Coupling", probability: "Moderate", impact: "High", status: "monitoring" },
			{ id: 2, name: "Satellite-Ground Calibration Problems", probability: "Moderate", impact: "High", status: "monitoring" },
			{ id: 3, name: "Inadequate Spatial Extrapolation", probability: "High", impact: "Moderate", status: "active" }
		],
		teamMembers: [
			{ name: "Primary Researcher", fte: 1.0, currentTasks: 4, workload: "high" },
			{ name: "Technical Support", fte: 0.25, currentTasks: 1, workload: "low" },
			{ name: "Remote Sensing Specialist", fte: 0.3, currentTasks: 2, workload: "medium" },
			{ name: "ML Specialist", fte: 0.25, currentTasks: 1, workload: "low" },
			{ name: "Agricultural Expert", fte: 0.1, currentTasks: 1, workload: "low" }
		]
	});

	const [activeView, setActiveView] = useState<"timeline" | "team" | "risks">('timeline');

	// Calculate overall project progress
	const calculateOverallProgress = () => {
		const totalTasks = Object.values(projectData.workPackages).reduce(
			(total: number, wp: WorkPackage) => total + Object.keys(wp.tasks).length,
			0
		);
		const completedTasks = Object.values(projectData.workPackages).reduce(
			(total: number, wp: WorkPackage) =>
				total + Object.values(wp.tasks).filter((task: Task) => task.completed).length,
			0
		);
		return Math.round((completedTasks / totalTasks) * 100);
	};

	// Update task completion
	const toggleTask = (wpId: string, taskId: string) => {
		setProjectData((prev: ProjectData) => {
			const newData: ProjectData = { ...prev, workPackages: { ...prev.workPackages } };
			const wp = { ...newData.workPackages[wpId] } as WorkPackage;
			const tasks: TasksByKey = { ...wp.tasks };
			tasks[taskId] = { ...tasks[taskId], completed: !tasks[taskId].completed };
			wp.tasks = tasks;
			newData.workPackages[wpId] = wp;

			// Update work package progress
			const wpTasks: Task[] = Object.values(newData.workPackages[wpId].tasks);
			const completedTasks = wpTasks.filter((task: Task) => task.completed).length;
			newData.workPackages[wpId].progress = Math.round((completedTasks / wpTasks.length) * 100);

			// Update status based on progress
			if (newData.workPackages[wpId].progress === 0) {
				newData.workPackages[wpId].status = 'not-started';
			} else if (newData.workPackages[wpId].progress === 100) {
				newData.workPackages[wpId].status = 'complete';
			} else {
				newData.workPackages[wpId].status = 'in-progress';
			}

			return newData;
		});
	};

	// Update quality gate status
	const toggleQualityGate = (wpId: string) => {
		setProjectData((prev: ProjectData) => {
			const newData: ProjectData = { ...prev, workPackages: { ...prev.workPackages } };
			const currentStatus = newData.workPackages[wpId].qualityGate.passed;
			newData.workPackages[wpId].qualityGate.passed = currentStatus === null ? true :
				(currentStatus === true ? false : null);
			return newData;
		});
	};

	const getStatusColor = (status: WorkPackageStatus): string => {
		switch(status) {
			case 'complete': return 'text-green-600 bg-green-100';
			case 'in-progress': return 'text-yellow-600 bg-yellow-100';
			case 'not-started': return 'text-gray-600 bg-gray-100';
			case 'issue': return 'text-red-600 bg-red-100';
			default: return 'text-gray-600 bg-gray-100';
		}
	};

	const getQualityGateIcon = (passed: boolean | null) => {
		if (passed === null) return <Circle className="w-5 h-5 text-gray-400" />;
		if (passed === true) return <CheckCircle className="w-5 h-5 text-green-600" />;
		return <AlertTriangle className="w-5 h-5 text-red-600" />;
	};

	const WorkPackageCard = ({ wpId, wp }: { wpId: string; wp: WorkPackage }) => (
		<div className="bg-white rounded-lg shadow-md p-6 mb-6">
			<div className="flex justify-between items-start mb-4">
				<div>
					<h3 className="text-lg font-semibold text-gray-800">{wp.name}</h3>
					<p className="text-sm text-gray-600">{wp.timeline} • {wp.responsible}</p>
				</div>
				<div className="text-right">
					<div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(wp.status)}`}>
						{wp.status.replace('-', ' ').toUpperCase()}
					</div>
					<div className="text-sm text-gray-600 mt-1">{wp.progress}% complete</div>
				</div>
			</div>

			<div className="w-full bg-gray-200 rounded-full h-2 mb-4">
				<div 
					className="bg-blue-600 h-2 rounded-full transition-all duration-300"
					style={{ width: `${wp.progress}%` }}
				></div>
			</div>

			<div className="space-y-3 mb-4">
				{Object.entries(wp.tasks).map(([taskId, task]) => (
					<div key={taskId} className="flex items-start space-x-3">
						<button
							onClick={() => toggleTask(wpId, taskId)}
							className="mt-1 flex-shrink-0"
						>
							{task.completed ? 
								<CheckCircle className="w-5 h-5 text-green-600" /> :
								<Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
							}
						</button>
						<div className="flex-1">
							<div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
								{task.name}
							</div>
							<div className="text-sm text-gray-600">{task.details}</div>
						</div>
					</div>
				))}
			</div>

			<div className="border-t pt-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Target className="w-4 h-4 text-blue-600" />
						<span className="text-sm font-medium">Quality Gate:</span>
					</div>
					<button
						onClick={() => toggleQualityGate(wpId)}
						className="flex items-center space-x-2 hover:bg-gray-50 px-2 py-1 rounded"
					>
						{getQualityGateIcon(wp.qualityGate.passed)}
					</button>
				</div>
				<p className="text-sm text-gray-600 mt-1">{wp.qualityGate.name}</p>
				<p className="text-xs text-orange-600 mt-2">
					<strong>Contingency:</strong> {wp.contingency}
				</p>
			</div>
		</div>
	);

	const TimelineView = () => (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-bold text-gray-800 mb-4">Project Overview</h2>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="text-center">
						<div className="text-2xl font-bold text-blue-600">{calculateOverallProgress()}%</div>
						<div className="text-sm text-gray-600">Overall Progress</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-green-600">
							{Object.values(projectData.workPackages).filter(wp => wp.status === 'complete').length}
						</div>
						<div className="text-sm text-gray-600">Work Packages Complete</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-yellow-600">
							{Object.values(projectData.workPackages).filter(wp => wp.status === 'in-progress').length}
						</div>
						<div className="text-sm text-gray-600">In Progress</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-red-600">
							{projectData.risks.filter(risk => risk.status === 'active').length}
						</div>
						<div className="text-sm text-gray-600">Active Risks</div>
					</div>
				</div>
			</div>

			{Object.entries(projectData.workPackages).map(([wpId, wp]) => (
				<WorkPackageCard key={wpId} wpId={wpId} wp={wp} />
			))}
		</div>
	);

	const TeamView = () => (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-xl font-bold text-gray-800 mb-4">Team Workload</h2>
			<div className="space-y-4">
				{projectData.teamMembers.map((member, index) => (
					<div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
						<div>
							<div className="font-medium text-gray-800">{member.name}</div>
							<div className="text-sm text-gray-600">{member.fte} FTE • {member.currentTasks} active tasks</div>
						</div>
						<div className={`px-3 py-1 rounded-full text-xs font-medium ${
							member.workload === 'high' ? 'bg-red-100 text-red-600' :
							member.workload === 'medium' ? 'bg-yellow-100 text-yellow-600' :
							'bg-green-100 text-green-600'
						}`}
						>
							{member.workload.toUpperCase()} LOAD
						</div>
					</div>
				))}
			</div>
		</div>
	);

	const RiskView = () => (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-xl font-bold text-gray-800 mb-4">Risk Dashboard</h2>
			<div className="space-y-4">
				{projectData.risks.map((risk) => (
					<div key={risk.id} className="p-4 border border-gray-200 rounded-lg">
						<div className="flex items-center justify-between mb-2">
							<h3 className="font-medium text-gray-800">{risk.name}</h3>
							<div className={`px-2 py-1 rounded text-xs font-medium ${
								risk.status === 'active' ? 'bg-red-100 text-red-600' :
								risk.status === 'monitoring' ? 'bg-yellow-100 text-yellow-600' :
								'bg-green-100 text-green-600'
							}`}
							>
								{risk.status.toUpperCase()}
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-gray-600">Probability:</span>
								<span className="ml-1 font-medium">{risk.probability}</span>
							</div>
							<div>
								<span className="text-gray-600">Impact:</span>
								<span className="ml-1 font-medium">{risk.impact}</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">
						Subsurface Soil Moisture Prediction Project
					</h1>
					<p className="text-gray-600">12-Month Research Timeline with Interactive Progress Tracking</p>
				</div>

				<div className="flex space-x-4 mb-6">
					<button
						onClick={() => setActiveView('timeline')}
						className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
							activeView === 'timeline' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
						}`}
					>
						<Calendar className="w-4 h-4" />
						<span>Timeline</span>
					</button>
					<button
						onClick={() => setActiveView('team')}
						className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
							activeView === 'team' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
						}`}
					>
						<Users className="w-4 h-4" />
						<span>Team</span>
					</button>
					<button
						onClick={() => setActiveView('risks')}
						className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
							activeView === 'risks' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
						}`}
					>
						<AlertTriangle className="w-4 h-4" />
						<span>Risks</span>
					</button>
				</div>

				{activeView === 'timeline' && <TimelineView />}
				{activeView === 'team' && <TeamView />}
				{activeView === 'risks' && <RiskView />}
			</div>
		</div>
	);
};

export default ProjectDashboard;


