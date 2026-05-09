import React from 'react';
import { ResumeData } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export const FormEditor: React.FC<Props> = ({ data, onChange }) => {
  
  const updateInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const addExperience = () => {
    onChange({
      ...data,
      experience: [...data.experience, { role: '', company: '', duration: '', description: '' }]
    });
  };

  const updateExperience = (index: number, field: keyof ResumeData['experience'][number], value: string) => {
    const newExp = [...data.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    onChange({ ...data, experience: newExp });
  };

  const removeExperience = (index: number) => {
    const newExp = data.experience.filter((_, i) => i !== index);
    onChange({ ...data, experience: newExp });
  };

  const addSkill = () => {
    onChange({ ...data, skills: [...data.skills, ''] });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...data.skills];
    newSkills[index] = value;
    onChange({ ...data, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    const newSkills = data.skills.filter((_, i) => i !== index);
    onChange({ ...data, skills: newSkills });
  };

  const addEducation = () => {
    onChange({
      ...data,
      education: [...data.education, { degree: '', school: '', year: '' }]
    });
  };

  const updateEducation = (index: number, field: keyof ResumeData['education'][number], value: string) => {
    const newEducation = [...data.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    onChange({ ...data, education: newEducation });
  };

  const removeEducation = (index: number) => {
    const newEducation = data.education.filter((_, i) => i !== index);
    onChange({ ...data, education: newEducation });
  };

  const addLanguage = () => {
    onChange({ ...data, languages: [...data.languages, ''] });
  };

  const updateLanguage = (index: number, value: string) => {
    const newLanguages = [...data.languages];
    newLanguages[index] = value;
    onChange({ ...data, languages: newLanguages });
  };

  const removeLanguage = (index: number) => {
    const newLanguages = data.languages.filter((_, i) => i !== index);
    onChange({ ...data, languages: newLanguages });
  };

  // Common input classes
  const inputClass = "w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white transition-colors";
  const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1";

  return (
    <div className="space-y-8 pb-20">
      {/* Personal Info */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-brand-900 dark:text-brand-100 mb-4">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input 
              type="text" 
              value={data.personalInfo.fullName} 
              onChange={(e) => updateInfo('fullName', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Job Title</label>
            <input 
              type="text" 
              value={data.personalInfo.title} 
              onChange={(e) => updateInfo('title', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input 
              type="email" 
              value={data.personalInfo.email} 
              onChange={(e) => updateInfo('email', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input 
              type="text" 
              value={data.personalInfo.phone} 
              onChange={(e) => updateInfo('phone', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              type="text"
              value={data.personalInfo.location}
              onChange={(e) => updateInfo('location', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input
              type="url"
              value={data.personalInfo.website || ''}
              onChange={(e) => updateInfo('website', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Summary</label>
            <textarea 
              value={data.personalInfo.summary} 
              onChange={(e) => updateInfo('summary', e.target.value)}
              className={inputClass}
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-brand-900 dark:text-brand-100">Work Experience</h3>
          <button onClick={addExperience} className="text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 p-2 rounded flex items-center gap-1 font-medium">
            <Plus size={16} /> Add Job
          </button>
        </div>
        
        <div className="space-y-6">
          {data.experience.map((job, index) => (
            <div key={index} className="relative p-4 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
              <button onClick={() => removeExperience(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  placeholder="Role / Job Title"
                  value={job.role} 
                  onChange={(e) => updateExperience(index, 'role', e.target.value)}
                  className={inputClass}
                />
                <input 
                  placeholder="Company Name"
                  value={job.company} 
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  className={inputClass}
                />
                <input 
                  placeholder="Duration (e.g. 2020 - 2022)"
                  value={job.duration} 
                  onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                  className={inputClass}
                />
                <textarea 
                  placeholder="What did you do here?"
                  value={job.description} 
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  className={`${inputClass} md:col-span-2`}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

       {/* Skills */}
       <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-brand-900 dark:text-brand-100">Skills</h3>
          <button onClick={addSkill} className="text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 p-2 rounded flex items-center gap-1 font-medium">
            <Plus size={16} /> Add Skill
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {data.skills.map((skill, index) => (
            <div key={index} className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
              <input 
                value={skill}
                onChange={(e) => updateSkill(index, e.target.value)}
                className="bg-transparent p-2 outline-none text-sm w-32 text-slate-900 dark:text-white"
                placeholder="Skill..."
              />
              <button onClick={() => removeSkill(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-brand-900 dark:text-brand-100">Education</h3>
          <button onClick={addEducation} className="text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 p-2 rounded flex items-center gap-1 font-medium">
            <Plus size={16} /> Add Education
          </button>
        </div>

        <div className="space-y-6">
          {data.education.map((edu, index) => (
            <div key={index} className="relative p-4 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
              <button onClick={() => removeEducation(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="School / University"
                  value={edu.school}
                  onChange={(e) => updateEducation(index, 'school', e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Year"
                  value={edu.year}
                  onChange={(e) => updateEducation(index, 'year', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-brand-900 dark:text-brand-100">Languages</h3>
          <button onClick={addLanguage} className="text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 p-2 rounded flex items-center gap-1 font-medium">
            <Plus size={16} /> Add Language
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {data.languages.map((language, index) => (
            <div key={index} className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
              <input
                value={language}
                onChange={(e) => updateLanguage(index, e.target.value)}
                className="bg-transparent p-2 outline-none text-sm w-32 text-slate-900 dark:text-white"
                placeholder="Language..."
              />
              <button onClick={() => removeLanguage(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};