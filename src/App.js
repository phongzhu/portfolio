import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const defaultProfile = { full_name: '', headline: '', bio: '', location: '', email: '', phone_number: '', avatar_url: '', website_url: '', social_links: [] };
const defaultSettings = { background_color: '#f5e2de', surface_color: '#eaeaea', primary_color: '#6a2153', secondary_color: '#1d3a4d', text_color: '#162939', muted_color: '#9f8f99', header_font: 'DM Serif Display', body_font: 'DM Sans', header_text: '', body_text: '' };
const appearanceColors = [['background_color', 'Page background'], ['surface_color', 'Card surface'], ['primary_color', 'Primary color'], ['secondary_color', 'Secondary color'], ['text_color', 'Text color'], ['muted_color', 'Muted text']];

function Icon({ name, size = 18 }) {
  const paths = { arrow: <><path d="M7 17 17 7M7 7h10v10" /></>, down: <><path d="M7 10l5 5 5-5" /></>, plus: <><path d="M12 5v14M5 12h14" /></>, close: <><path d="m18 6-12 12M6 6l12 12" /></>, spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z" /></>, menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>, check: <><path d="m5 12 4 4L19 6" /></>, image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>, logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" /></> };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function PortfolioLogo({ className }) {
  return <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M10 31.5c7.8-.7 12.9-4.7 15.5-12.1C27.8 13 32.1 9.8 39 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M10 31.5c-.4-5.2-2.1-9.1-5.3-11.8M10 31.5c5.2-.1 9.4 1.6 12.5 5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="m32 21 2-5.1 5.1-2-5.1-2L32 6.8l-2 5.1-5.1 2 5.1 2L32 21Z" fill="currentColor" />
    <circle cx="10" cy="31.5" r="2.4" fill="currentColor" />
    <circle cx="39" cy="9" r="2" fill="currentColor" />
  </svg>;
}

function PortfolioLoader({ profile, settings }) {
  const name = profile.full_name.trim();
  const loaderVars = {
    '--loader-paper': settings.background_color || '#f5e2de',
    '--loader-ink': settings.text_color || '#162939',
    '--loader-primary': settings.primary_color || '#6a2153',
    '--loader-accent': settings.secondary_color || '#1d3a4d',
  };

  return <div className="portfolio-loader" style={loaderVars} role="status" aria-live="polite" aria-label="Loading portfolio">
    <div className="loader-art" aria-hidden="true">
      <svg viewBox="0 0 240 240" fill="none">
        <circle className="loader-orbit loader-orbit-one" cx="120" cy="120" r="82" />
        <ellipse className="loader-orbit loader-orbit-two" cx="120" cy="120" rx="101" ry="47" transform="rotate(-38 120 120)" />
        <ellipse className="loader-orbit loader-orbit-three" cx="120" cy="120" rx="97" ry="38" transform="rotate(42 120 120)" />
        <circle className="loader-core" cx="120" cy="120" r="48" />
        <path className="loader-spark" d="m190 45 5 14 14 5-14 5-5 14-5-14-14-5 14-5 5-14Z" />
        <circle className="loader-node loader-node-one" cx="39" cy="105" r="4" />
        <circle className="loader-node loader-node-two" cx="186" cy="175" r="4" />
      </svg>
      <PortfolioLogo className="loader-logo" />
    </div>
    <div className="loader-copy">
      <p className="loader-title">{name ? `Loading ${name.split(/\s+/)[0]}’s portfolio…` : 'Loading…'}</p>
      <span className="loader-progress" aria-hidden="true"><i /></span>
    </div>
  </div>;
}

function normalizeSocialLinks(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    let url = String(item?.url || '').trim();
    const repeatedProtocol = url.slice(8).search(/https?:\/\//i);
    if (repeatedProtocol >= 0) url = url.slice(0, 8 + repeatedProtocol);
    let label = String(item?.label || '').trim();
    if (!label || /^https?:\/\//i.test(label)) {
      try {
        const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
        label = host.includes('linkedin') ? 'LinkedIn' : host.includes('instagram') ? 'Instagram' : host.includes('github') ? 'GitHub' : host.includes('facebook') ? 'Facebook' : host.includes('tiktok') ? 'TikTok' : host.includes('youtube') ? 'YouTube' : host.includes('behance') ? 'Behance' : host.includes('dribbble') ? 'Dribbble' : host.includes('x.com') || host.includes('twitter') ? 'X' : host || 'Social profile';
      } catch { label = 'Social profile'; }
    }
    return { id: item?.id || `social-link-${index}`, label, url };
  }).filter((item) => item.url);
}

function formatMonthYear(value) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
}

function formatDateRange(start, end, isCurrent) {
  return [formatMonthYear(start), isCurrent ? 'Present' : formatMonthYear(end)].filter(Boolean).join(' — ');
}

function ExperienceSection({ experiences }) {
  if (!experiences.length) return null;
  return <section className="experience-section" id="experience"><div className="section-heading"><div><div className="eyebrow">CAREER PATH</div><h2>Experience</h2><p>Roles, teams, and work that shaped my practice.</p></div></div><div className="experience-timeline">{experiences.map((entry) => <article className="experience-public-card" key={entry.id}><div className="experience-timeline-mark" /><div className="experience-public-heading"><div><span className="experience-org">{entry.organization}</span><h3>{entry.role_title}</h3></div><span className="experience-dates">{formatDateRange(entry.start_date, entry.end_date, entry.is_current)}</span></div><div className="experience-meta">{entry.employment_type && <span>{entry.employment_type}</span>}{entry.workplace_type && <span>{entry.workplace_type}</span>}{entry.location && <span>{entry.location}</span>}</div>{entry.description && <p>{entry.description}</p>}</article>)}</div></section>;
}

function CredentialsSection({ credentials }) {
  if (!credentials.length) return null;
  return <section className="credentials-section" id="credentials"><div className="section-heading"><div><div className="eyebrow">RECOGNITION &amp; LEARNING</div><h2>Awards &amp; certifications</h2><p>Credentials and milestones earned along the way.</p></div></div><div className="credentials-grid">{credentials.map((entry) => <article className="credential-public-card" key={entry.id}>{entry.image_url && <a className="credential-public-image" href={entry.credential_url || entry.image_url} target="_blank" rel="noreferrer"><img src={entry.image_url} alt={`${entry.title} certificate`} /></a>}<div className="credential-public-copy"><span className="credential-kind">{entry.kind === 'award' ? 'AWARD' : 'CERTIFICATION'}</span><h3>{entry.title}</h3>{entry.issuer && <p className="credential-issuer">{entry.issuer}</p>}{(entry.issued_on || entry.expires_on) && <p className="credential-dates">{entry.issued_on ? `Issued ${formatMonthYear(entry.issued_on)}` : ''}{entry.expires_on ? ` · Expires ${formatMonthYear(entry.expires_on)}` : ''}</p>}{entry.credential_id && <p className="credential-id">Credential ID · {entry.credential_id}</p>}{entry.description && <p>{entry.description}</p>}{entry.credential_url && <a className="text-link" href={entry.credential_url} target="_blank" rel="noreferrer">View credential <Icon name="arrow" size={14} /></a>}</div></article>)}</div></section>;
}

function SkillsSection({ skills }) {
  if (!skills.length) return null;
  const groups = skills.reduce((all, skill) => {
    const key = skill.category || 'Skills';
    (all[key] ||= []).push(skill);
    return all;
  }, {});
  return <section className="skills-section" id="skills"><div className="section-heading"><div><div className="eyebrow">WHAT I DO</div><h2>Skills &amp; strengths</h2><p>Tools, techniques, and abilities I bring to a project.</p></div></div><div className="public-skill-groups">{Object.entries(groups).map(([category, items]) => <div className="public-skill-group" key={category}><h3>{category}</h3><div className="public-skill-list">{items.map((skill) => <article className="public-skill" key={skill.id}><div><h4>{skill.name}</h4>{skill.description && <p>{skill.description}</p>}</div>{skill.proficiency && <span>{skill.proficiency}</span>}</article>)}</div></div>)}</div></section>;
}

function EducationSection({ education }) {
  if (!education.length) return null;
  return <section className="education-section" id="education"><div className="section-heading"><div><div className="eyebrow">LEARNING &amp; GROWTH</div><h2>Education</h2></div></div><div className="education-list">{education.map((entry) => <article className="education-card" key={entry.id}><div className="education-date">{entry.start_date ? formatMonthYear(entry.start_date) : ''}{entry.start_date && (entry.is_current || entry.end_date) ? ' — ' : ''}{entry.is_current ? 'Present' : formatMonthYear(entry.end_date)}</div><div><h3>{entry.institution}</h3>{(entry.degree || entry.field_of_study) && <p className="education-program">{[entry.degree, entry.field_of_study].filter(Boolean).join(' · ')}</p>}{entry.description && <p>{entry.description}</p>}{entry.activities && <p>{entry.activities}</p>}{entry.related_skills?.length > 0 && <div className="public-skill-list compact">{entry.related_skills.map((skill) => <span className="public-skill-chip" key={skill}>{skill}</span>)}</div>}</div></article>)}</div></section>;
}

function ActivitiesSection({ activities, profile, embedded = false }) {
  if (!activities.length) return null;
  const initials = (profile.full_name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return <section className={`activities-section${embedded ? ' activities-embedded' : ''}`} id="activities">{!embedded && <div className="section-heading"><div><div className="eyebrow">NOTES FROM THE STUDIO</div><h2>Activities</h2><p>Updates, milestones, and things I have been working on.</p></div></div>}<div className="activity-feed">{activities.map((post) => <article className="activity-post" key={post.id}><header className="activity-post-head">{profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <span>{initials || '•'}</span>}<div><strong>{profile.full_name || 'Portfolio'}</strong><time dateTime={post.created_at}>{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(post.created_at))}</time></div></header>{post.content && <p className="activity-post-content">{post.content}</p>}{post.media_urls.length > 0 && <div className={`activity-media activity-media-${Math.min(post.media_urls.length, 4)}`}>{post.media_urls.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`Post attachment ${index + 1}`} loading="lazy" />)}</div>}</article>)}</div></section>;
}

function ProjectModal({ project, onClose }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = project.images || [];
  const moveImage = (direction) => setActiveImage((current) => (current + direction + images.length) % images.length);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (images.length > 1 && event.key === 'ArrowLeft') { event.preventDefault(); setActiveImage((current) => (current - 1 + images.length) % images.length); }
      if (images.length > 1 && event.key === 'ArrowRight') { event.preventDefault(); setActiveImage((current) => (current + 1) % images.length); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [images.length, onClose]);

  return <div className="modal-backdrop project-backdrop" onClick={onClose}>
    <article className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="Close project"><Icon name="close" /></button>
      <div className="modal-gallery" aria-label="Project image gallery">
        <div className="modal-gallery-stage">
          {images.length > 0 ? <img key={images[activeImage]} src={images[activeImage]} alt={`${project.title} screenshot ${activeImage + 1} of ${images.length}`} /> : <div className="modal-gallery-empty">No project screenshots available</div>}
          {images.length > 1 && <>
            <button className="gallery-arrow gallery-previous" type="button" onClick={() => moveImage(-1)} aria-label="Previous image"><span aria-hidden="true">←</span></button>
            <button className="gallery-arrow gallery-next" type="button" onClick={() => moveImage(1)} aria-label="Next image"><span aria-hidden="true">→</span></button>
            <span className="gallery-counter" aria-live="polite">{String(activeImage + 1).padStart(2, '0')} <i /> {String(images.length).padStart(2, '0')}</span>
          </>}
        </div>
        {images.length > 1 && <div className="modal-gallery-thumbnails" aria-label="Choose a project screenshot">{images.map((src, index) => <button type="button" key={src} className={activeImage === index ? 'active' : ''} onClick={() => setActiveImage(index)} aria-label={`Show image ${index + 1}`} aria-pressed={activeImage === index}><img src={src} alt="" /></button>)}</div>}
      </div>
      <div className="modal-content">
        <div className="eyebrow">CASE STUDY{project.year && ` · ${project.year}`}</div>
        <h2 id="project-modal-title">{project.title}</h2>
        {project.summary && <p className="modal-summary">{project.summary}</p>}
        {project.description && project.description !== project.summary && <p className="modal-description">{project.description}</p>}
        {project.tags?.length > 0 && <><div className="modal-detail-label">TOOLS &amp; TECHNOLOGIES</div><div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></>}
        <div className="modal-actions">{project.project_url && <a href={project.project_url} target="_blank" rel="noreferrer" className="button button-dark">Visit project <Icon name="arrow" size={15} /></a>}{project.source_url && <a href={project.source_url} target="_blank" rel="noreferrer" className="text-link">View source <Icon name="arrow" size={15} /></a>}</div>
      </div>
    </article>
  </div>;
}

function SkillsEducationManager({ skills, education, skillForm, setSkillForm, educationForm, setEducationForm, saving, onSaveSkill, onSaveEducation, onDeleteSkill, onDeleteEducation }) {
  return <div className="manager-body records-manager skills-education-manager">
    <section className="records-section skills-record-section"><div className="manager-section-title"><div><span className="manager-kicker">YOUR TOOLKIT</span><h3>Skills <span className="manager-count">{skills.length}</span></h3><p>Show visitors what you do well. Add a skill, then group it by category.</p></div>{!skillForm && <button className="button button-dark" onClick={() => setSkillForm({})}><Icon name="plus" size={15} /> Add skill</button>}</div>
      {skillForm && <form className="record-form" onSubmit={onSaveSkill}><div className="form-grid"><label>Skill<input name="name" required defaultValue={skillForm.name || ''} placeholder="UI design, React, project coordination" /></label><label>Category<input name="category" defaultValue={skillForm.category || ''} placeholder="Development, design, communication" /></label><label>Experience level<select name="proficiency" defaultValue={skillForm.proficiency || ''}><option value="">Skip this</option><option>Learning</option><option>Working knowledge</option><option>Proficient</option><option>Advanced</option></select></label><label className="full">Short description <small>Optional</small><input name="description" defaultValue={skillForm.description || ''} placeholder="What you can do with this skill" /></label><label className="record-check"><input name="published" type="checkbox" defaultChecked={skillForm.id ? skillForm.published : true} /> Show on my portfolio</label></div><div className="record-form-actions"><button type="button" className="button button-outline" onClick={() => setSkillForm(null)}>Cancel</button><button className="button button-dark" disabled={saving}>{saving ? 'Saving…' : skillForm.id ? 'Save skill' : 'Add skill'}</button></div></form>}
      {skills.length ? <div className="manager-table-scroll" role="region" aria-label="Skills table" tabIndex="0"><table className="manager-table skills-table"><thead><tr><th scope="col">Skill</th><th scope="col">Category</th><th scope="col">Experience</th><th scope="col">Visibility</th><th scope="col">Actions</th></tr></thead><tbody>{skills.map((skill) => <tr key={skill.id}><td><strong>{skill.name}</strong>{skill.description && <small>{skill.description}</small>}</td><td>{skill.category || '—'}</td><td>{skill.proficiency || '—'}</td><td><span className={`table-status${skill.published ? '' : ' draft'}`}><i />{skill.published ? 'Published' : 'Draft'}</span></td><td><div className="record-actions"><button type="button" onClick={() => setSkillForm(skill)}>Edit</button><button type="button" onClick={() => onDeleteSkill(skill.id)}>Delete</button></div></td></tr>)}</tbody></table></div> : !skillForm && <div className="record-empty">No skills added yet. Add the strengths you want visitors to know about.</div>}
    </section>
    <section className="records-section education-record-section"><div className="manager-section-title"><div><span className="manager-kicker">LEARNING &amp; QUALIFICATIONS</span><h3>Education <span className="manager-count">{education.length}</span></h3><p>Add schools, degrees, courses, activities, and related skills.</p></div>{!educationForm && <button className="button button-dark" onClick={() => setEducationForm({})}><Icon name="plus" size={15} /> Add education</button>}</div>
      {educationForm && <form className="record-form" onSubmit={onSaveEducation}><div className="form-grid"><label>School or institution<input name="institution" required defaultValue={educationForm.institution || ''} placeholder="University or school name" /></label><label>Degree or qualification<input name="degree" defaultValue={educationForm.degree || ''} placeholder="Bachelor's degree, diploma, certificate" /></label><label className="full">Field of study<input name="field_of_study" defaultValue={educationForm.field_of_study || ''} placeholder="Information Technology, Web Development" /></label><label>Start date<input type="date" name="start_date" defaultValue={educationForm.start_date || ''} /></label><label>End date <small>Leave blank if still studying</small><input type="date" name="end_date" defaultValue={educationForm.end_date || ''} /></label><label className="record-check"><input type="checkbox" name="is_current" defaultChecked={educationForm.is_current} /> I currently study here</label><label>Related skills <small>Separate with commas</small><input name="related_skills" defaultValue={(educationForm.related_skills || []).join(', ')} placeholder="Web development, research" /></label><label className="full">Activities and societies <small>Optional</small><textarea name="activities" rows="2" defaultValue={educationForm.activities || ''} placeholder="Clubs, leadership roles, publications" /></label><label className="full">Description <small>Optional</small><textarea name="description" rows="3" defaultValue={educationForm.description || ''} placeholder="What you studied or accomplished" /></label><label className="record-check"><input name="published" type="checkbox" defaultChecked={educationForm.id ? educationForm.published : true} /> Show on my portfolio</label></div><div className="record-form-actions"><button type="button" className="button button-outline" onClick={() => setEducationForm(null)}>Cancel</button><button className="button button-dark" disabled={saving}>{saving ? 'Saving…' : educationForm.id ? 'Save education' : 'Add education'}</button></div></form>}
      {education.length ? <div className="manager-table-scroll" role="region" aria-label="Education table" tabIndex="0"><table className="manager-table education-table"><thead><tr><th scope="col">School &amp; qualification</th><th scope="col">Period</th><th scope="col">Related skills</th><th scope="col">Visibility</th><th scope="col">Actions</th></tr></thead><tbody>{education.map((entry) => <tr key={entry.id}><td><strong>{entry.institution}</strong>{(entry.degree || entry.field_of_study) && <small>{[entry.degree, entry.field_of_study].filter(Boolean).join(' · ')}</small>}{(entry.description || entry.activities) && <small className="table-description">{entry.description || entry.activities}</small>}</td><td>{entry.start_date ? formatMonthYear(entry.start_date) : ''}{entry.start_date && (entry.is_current || entry.end_date) ? ' – ' : ''}{entry.is_current ? 'Present' : formatMonthYear(entry.end_date)}</td><td>{entry.related_skills?.length > 0 ? <div className="table-tags">{entry.related_skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : '—'}</td><td><span className={`table-status${entry.published ? '' : ' draft'}`}><i />{entry.published ? 'Published' : 'Draft'}</span></td><td><div className="record-actions"><button type="button" onClick={() => setEducationForm(entry)}>Edit</button><button type="button" onClick={() => onDeleteEducation(entry.id)}>Delete</button></div></td></tr>)}</tbody></table></div> : !educationForm && <div className="record-empty">No education added yet. Add a school or qualification to build this section.</div>}
    </section>
  </div>;
}

function ActivityEditor({ entry, saving, profile, onSubmit, onCancel }) {
  const [keptPaths, setKeptPaths] = useState(entry?.media_paths || []);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [fileNotice, setFileNotice] = useState('');
  const publicUrl = (path) => supabase.storage.from('portfolio-images').getPublicUrl(path).data.publicUrl;
  function chooseFiles(event) {
    const files = Array.from(event.target.files || []);
    const remaining = Math.max(0, 8 - keptPaths.length);
    if (files.length > remaining) { setFileNotice(`You can add ${remaining} more photo${remaining === 1 ? '' : 's'} to this post (maximum 8).`); event.target.value = ''; return; }
    setFileNotice('');
    setNewFiles(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  }
  const initials = (profile.full_name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return <form className="activity-composer" onSubmit={(event) => onSubmit(event, { keptPaths, newFiles })}>
    {entry?.id && <input type="hidden" name="id" value={entry.id} />}
    <header className="activity-post-head">{profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <span>{initials || '•'}</span>}<div><strong>{profile.full_name || 'Your portfolio'}</strong><small>{entry?.id ? 'Edit your post' : 'Share an update'}</small></div></header>
    <textarea name="content" rows="5" defaultValue={entry?.content || ''} placeholder="What have you been working on? Share a project update, milestone, or thought…" />
    {(keptPaths.length > 0 || previews.length > 0) && <div className="activity-compose-media">{keptPaths.map((path) => <div key={path}><img src={publicUrl(path)} alt="Post attachment" /><button type="button" onClick={() => setKeptPaths((current) => current.filter((item) => item !== path))} aria-label="Remove attached image"><Icon name="close" size={14} /></button></div>)}{previews.map((url, index) => <div key={`${url}-${index}`}><img src={url} alt={`New post attachment ${index + 1}`} /><button type="button" onClick={() => { setNewFiles((files) => files.filter((_, itemIndex) => itemIndex !== index)); setPreviews((items) => items.filter((_, itemIndex) => itemIndex !== index)); }} aria-label="Remove selected image"><Icon name="close" size={14} /></button></div>)}</div>}
    {fileNotice && <p className="form-message" role="alert">{fileNotice}</p>}
    <div className="activity-composer-footer"><label className="activity-add-media"><Icon name="image" size={16} /> Add photos <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={keptPaths.length + newFiles.length >= 8} onChange={chooseFiles} /></label><span>{keptPaths.length + newFiles.length}/8 photos</span><label className="activity-publish"><input name="published" type="checkbox" defaultChecked={entry ? entry.published : true} /> Publish post</label><div className="record-form-actions"><button type="button" className="button button-outline" onClick={onCancel}>Cancel</button><button className="button button-dark" disabled={saving}>{saving ? 'Posting…' : entry?.id ? 'Save post' : 'Post update'}</button></div></div>
  </form>;
}

function ActivitiesManager({ activities, activityForm, setActivityForm, saving, profile, onSave, onDelete }) {
  return <div className="manager-body records-manager activities-manager"><div className="manager-section-title"><div><h3>Activities</h3><p>Share updates, milestones, and photos. Published posts appear in date order on your portfolio.</p></div>{!activityForm && <button className="button button-dark" onClick={() => setActivityForm({})}><Icon name="plus" size={15} /> Create post</button>}</div>
    {activityForm && <ActivityEditor key={activityForm.id || 'new-activity'} entry={activityForm} saving={saving} profile={profile} onSubmit={onSave} onCancel={() => setActivityForm(null)} />}
    {activities.length ? <div className="activity-admin-list">{activities.map((post) => <article className="activity-admin-card" key={post.id}><header><span className={`record-status${post.published ? '' : ' draft'}`}>{post.published ? 'PUBLISHED' : 'DRAFT'}</span><time>{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(post.created_at))}</time></header>{post.content && <p>{post.content}</p>}{post.media_urls.length > 0 && <div className="activity-compose-media">{post.media_urls.map((url) => <img key={url} src={url} alt="Post attachment" />)}</div>}<div className="record-actions"><button type="button" onClick={() => setActivityForm(post)}>Edit post</button><button type="button" onClick={() => onDelete(post.id)}>Delete post</button></div></article>)}</div> : !activityForm && <div className="record-empty">No updates yet. Create a post to share something with your visitors.</div>}
  </div>;
}

function SocialLinksEditor({ links, onChange }) {
  function markFor(label) {
    const value = label.toLowerCase();
    return value.includes('linkedin') ? 'in' : value.includes('github') ? 'gh' : value.includes('instagram') ? 'ig' : value.includes('facebook') ? 'f' : value.includes('youtube') ? 'yt' : value.includes('tiktok') ? 'tk' : value.includes('twitter') || value === 'x' ? 'x' : value ? value.slice(0, 2) : '↗';
  }
  function updateLink(index, key, value) {
    onChange(links.map((link, itemIndex) => itemIndex === index ? { ...link, [key]: value } : link));
  }
  return <div className="social-links-editor full">
    {links.map((link, index) => <div className="social-link-row" key={link.id}>
      <label className="social-platform-field">Platform name<div className="social-platform-input"><span className="social-platform-mark" aria-hidden="true">{markFor(link.label)}</span><input autoComplete="off" value={link.label} onChange={(event) => updateLink(index, 'label', event.target.value)} placeholder="LinkedIn, GitHub, Instagram..." /></div></label>
      <label>Profile URL<input type="url" autoComplete="url" value={link.url} onChange={(event) => updateLink(index, 'url', event.target.value)} placeholder="https://..." /></label>
      <button type="button" className="remove-social-link" onClick={() => onChange(links.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${link.label || 'social'} link`} title="Remove link"><Icon name="close" size={16} /></button>
    </div>)}
    <button type="button" className="add-social-link" onClick={() => onChange([...links, { id: `social-link-${Date.now()}-${Math.random().toString(36).slice(2)}`, label: '', url: '' }])}><Icon name="plus" size={15} /> Add social link</button>
  </div>;
}

function ProfileEditor({ profile, socialLinks, onSocialLinksChange, avatarPreview, onAvatarChange, saving, onSubmit, onCancel }) {
  return <div className="manager-body profile-page">
    <form className="edit-form profile-form" onSubmit={onSubmit}>
      <section className="profile-card">
        <div className="profile-card-heading"><h3>Profile information</h3><p>Add a photo and a short introduction.</p></div>
        <div className="profile-info-layout">
          <div className="profile-photo-editor">{(avatarPreview || profile.avatar_url) ? <img className="profile-preview" src={avatarPreview || profile.avatar_url} alt="Profile preview" /> : <div className="profile-preview-placeholder">No photo selected</div>}<label className="upload-zone"><Icon name="image" /><span>{avatarPreview ? 'Photo ready to save' : 'Upload a profile photo'}<small>JPG, PNG, WebP, or AVIF · Up to 10 MB</small></span><input name="avatar_file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onAvatarChange} /></label></div>
          <div className="form-grid profile-fields"><label>Full name<input name="full_name" autoComplete="name" defaultValue={profile.full_name} required /></label><label>Headline<input name="headline" defaultValue={profile.headline} /></label><label className="full">Bio<textarea name="bio" rows="5" defaultValue={profile.bio} /></label></div>
        </div>
      </section>
      <section className="profile-card">
        <div className="profile-card-heading"><h3>Contact details</h3><p>Choose how visitors can reach you.</p></div>
        <div className="form-grid"><label>Location<input name="location" autoComplete="address-level2" defaultValue={profile.location} /></label><label>Phone<input name="phone_number" type="tel" autoComplete="tel" defaultValue={profile.phone_number || ''} placeholder="+63 900 000 0000" /></label><label>Email<input name="email" type="email" autoComplete="email" defaultValue={profile.email} /></label><label>Website<input name="website_url" type="url" autoComplete="url" defaultValue={profile.website_url || ''} placeholder="https://yourwebsite.com" /></label></div>
      </section>
      <section className="profile-card">
        <div className="profile-card-heading"><h3>Social media links</h3><p>Add one row for each platform and paste its full profile link.</p></div>
        <SocialLinksEditor links={socialLinks} onChange={onSocialLinksChange} />
        <div className="profile-form-actions"><button className="button button-dark" disabled={saving}>{saving ? 'Saving changes…' : 'Save changes'} {!saving && <Icon name="check" size={15} />}</button><button type="button" className="button button-outline" onClick={(event) => onCancel(event.currentTarget.form)}>Cancel</button></div>
      </section>
    </form>
  </div>;
}

function AppearanceEditor({ settings, saving, backgroundPreview, onSubmit, onBackgroundChange }) {
  const [colorValues, setColorValues] = useState(() => Object.fromEntries(appearanceColors.map(([name]) => [name, settings[name]])));
  const [fontValues, setFontValues] = useState({ heading: settings.header_font, body: settings.body_font });
  useEffect(() => { setColorValues(Object.fromEntries(appearanceColors.map(([name]) => [name, settings[name]]))); }, [settings]);
  useEffect(() => setFontValues({ heading: settings.header_font, body: settings.body_font }), [settings]);
  const headingFonts = ['DM Serif Display', 'Playfair Display', 'Lora', 'Cormorant Garamond', 'Libre Baskerville', 'Fraunces', 'Gloock', 'Bodoni Moda', 'Merriweather', 'Crimson Pro', 'EB Garamond', 'Instrument Serif', 'Newsreader', 'Spectral', 'Source Serif 4'];
  const bodyFonts = ['DM Sans', 'Manrope', 'Inter', 'Work Sans', 'Nunito Sans', 'Montserrat', 'Plus Jakarta Sans', 'Outfit', 'Space Grotesk', 'IBM Plex Sans', 'Roboto', 'Open Sans', 'Poppins', 'Rubik', 'Source Sans 3', 'Fira Sans', 'Archivo', 'Urbanist'];
  return <div className="manager-body appearance-page">
    <form className="edit-form appearance-form" onSubmit={onSubmit}>
      <section className="appearance-group">
        <div className="appearance-group-heading"><h4>Portfolio introduction</h4><p>These words appear above your projects.</p></div>
        <div className="appearance-copy-grid">
          <label>Section heading<input name="header_text" defaultValue={settings.header_text} placeholder="Selected work" /></label>
          <label>Short introduction<input name="body_text" defaultValue={settings.body_text} placeholder="A few words about your work" /></label>
        </div>
      </section>
      <section className="appearance-group">
        <div className="appearance-group-heading"><h4>Color palette</h4><p>Select a color swatch to update your portfolio. The value is shown beside it.</p></div>
        <div className="appearance-color-grid">{appearanceColors.map(([name, label]) => <label className="color-field" key={name}><span className="color-field-label">{label}</span><span className="color-picker-row"><input type="color" name={name} value={colorValues[name] || settings[name]} onChange={(event) => setColorValues((current) => ({ ...current, [name]: event.target.value }))} aria-label={label} /><code>{colorValues[name] || settings[name]}</code></span></label>)}</div>
      </section>
      <section className="appearance-group">
        <div className="appearance-group-heading"><h4>Background image</h4><p>Optional. A subtle image can sit behind your portfolio content.</p></div>
        <div className="appearance-background">
          <label className="upload-zone"><Icon name="image" /><span>{backgroundPreview ? 'Image selected' : settings.background_image_url ? 'Choose a different background image' : 'Choose a background image'}<small>JPG, PNG, WebP, or AVIF · Up to 10 MB</small></span><input name="background_image_file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onBackgroundChange} /></label>
          {(backgroundPreview || settings.background_image_url) ? <div className="appearance-preview-wrap"><img className="background-preview" src={backgroundPreview || settings.background_image_url} alt="Portfolio background preview" /><span>{backgroundPreview ? 'Preview of the image you selected' : 'Current background image'}</span></div> : <div className="appearance-image-empty"><Icon name="image" size={20} /><span>No background image selected</span></div>}
        </div>
      </section>
      <section className="appearance-group">
        <div className="appearance-group-heading"><h4>Typography</h4><p>Choose a heading style and a readable body font.</p></div>
        <div className="appearance-font-grid">
          <label>Heading font<select name="header_font" value={fontValues.heading} onChange={(event) => setFontValues((current) => ({ ...current, heading: event.target.value }))}>{headingFonts.map((font) => <option key={font}>{font}</option>)}</select><small className="font-sample heading-sample" style={{ fontFamily: `'${fontValues.heading}', Georgia, serif` }}>A thoughtful heading</small></label>
          <label>Body font<select name="body_font" value={fontValues.body} onChange={(event) => setFontValues((current) => ({ ...current, body: event.target.value }))}>{bodyFonts.map((font) => <option key={font}>{font}</option>)}</select><small className="font-sample" style={{ fontFamily: `'${fontValues.body}', sans-serif` }}>Clear, comfortable text for paragraphs and labels.</small></label>
        </div>
      </section>
      <div className="appearance-save-row"><p>Your changes appear on the landing page after saving.</p><button className="button button-dark save-button" disabled={saving}>{saving ? 'Saving appearance…' : 'Save appearance'} {!saving && <Icon name="check" size={15} />}</button></div>
    </form>
  </div>;
}

function ExperienceForm({ entry, saving, onSubmit, onCancel }) {
  const [isCurrent, setIsCurrent] = useState(Boolean(entry?.is_current));
  return <form className="record-form" onSubmit={onSubmit}>
    {entry?.id && <input type="hidden" name="id" value={entry.id} />}
    <div className="form-grid"><label>Role or position<input name="role_title" required defaultValue={entry?.role_title || ''} placeholder="Software engineering intern" /></label><label>Organization<input name="organization" required defaultValue={entry?.organization || ''} placeholder="Company or organization" /></label><label>Employment type<select name="employment_type" defaultValue={entry?.employment_type || ''}><option value="">Choose type</option><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Volunteer</option><option>Freelance</option></select></label><label>Work arrangement<select name="workplace_type" defaultValue={entry?.workplace_type || ''}><option value="">Choose arrangement</option><option>On-site</option><option>Hybrid</option><option>Remote</option></select></label><label>Location<input name="location" defaultValue={entry?.location || ''} placeholder="City, region, country" /></label><label>Start date<input name="start_date" type="date" required defaultValue={entry?.start_date || ''} /></label><label>End date<input name="end_date" type="date" disabled={isCurrent} defaultValue={entry?.end_date || ''} /></label><label className="record-check"><input name="is_current" type="checkbox" checked={isCurrent} onChange={(event) => setIsCurrent(event.target.checked)} /> I currently work here</label><label className="full">Description<textarea name="description" rows="4" defaultValue={entry?.description || ''} placeholder="Share your responsibilities, contributions, or results." /></label><label className="record-check"><input name="published" type="checkbox" defaultChecked={entry ? entry.published : true} /> Show on my portfolio</label></div>
    <div className="record-form-actions"><button type="button" className="button button-outline" onClick={onCancel}>Cancel</button><button className="button button-dark" disabled={saving}>{saving ? 'Saving…' : entry?.id ? 'Save experience' : 'Add experience'}</button></div>
  </form>;
}

function CredentialForm({ entry, saving, onSubmit, onCancel }) {
  const [imagePreview, setImagePreview] = useState('');
  return <form className="record-form" onSubmit={onSubmit}>
    {entry?.id && <input type="hidden" name="id" value={entry.id} />}
    <div className="form-grid"><label>Type<select name="kind" defaultValue={entry?.kind || 'certification'}><option value="certification">Certification</option><option value="award">Award</option></select></label><label>Name<input name="title" required defaultValue={entry?.title || ''} placeholder="Certification or award name" /></label><label>Issuer<input name="issuer" defaultValue={entry?.issuer || ''} placeholder="Organization that issued it" /></label><label>Issue date<input name="issued_on" type="date" defaultValue={entry?.issued_on || ''} /></label><label>Expiration date <small>Optional</small><input name="expires_on" type="date" defaultValue={entry?.expires_on || ''} /></label><label>Credential ID <small>Optional</small><input name="credential_id" defaultValue={entry?.credential_id || ''} /></label><label className="full">Credential link <small>Optional</small><input name="credential_url" type="url" defaultValue={entry?.credential_url || ''} placeholder="https://" /></label><label className="full">Description <small>Optional</small><textarea name="description" rows="3" defaultValue={entry?.description || ''} /></label><label className="upload-zone full"><Icon name="image" /><span>{imagePreview ? 'Certificate image selected' : entry?.image_path ? 'Replace certificate image' : 'Add a certificate image'}<small>JPG, PNG, WebP, or AVIF · Up to 10 MB</small></span><input name="credential_image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => { const file = event.target.files?.[0]; setImagePreview(file ? URL.createObjectURL(file) : ''); }} /></label>{(imagePreview || entry?.image_url) && <img className="credential-image-preview full" src={imagePreview || entry.image_url} alt="Credential preview" />}<label className="record-check"><input name="published" type="checkbox" defaultChecked={entry ? entry.published : true} /> Show on my portfolio</label></div>
    <div className="record-form-actions"><button type="button" className="button button-outline" onClick={onCancel}>Cancel</button><button className="button button-dark" disabled={saving}>{saving ? 'Saving…' : entry?.id ? 'Save credential' : 'Add to portfolio'}</button></div>
  </form>;
}

function ExperienceManager({ experiences, credentials, experienceForm, setExperienceForm, credentialForm, setCredentialForm, saving, onSaveExperience, onSaveCredential, onDeleteExperience, onDeleteCredential }) {
  return <div className="manager-body experience-manager">
    <section className="records-panel"><div className="records-heading"><div><h3>Experience</h3><p>Share the roles and organizations you have worked with.</p></div><button className="button button-dark" onClick={() => setExperienceForm({})}><Icon name="plus" size={15} /> Add experience</button></div>
      {experienceForm && <ExperienceForm key={experienceForm.id || 'new-experience'} entry={experienceForm} saving={saving} onSubmit={onSaveExperience} onCancel={() => setExperienceForm(null)} />}
      {experiences.length ? <div className="experience-admin-list">{experiences.map((entry) => <article className="experience-admin-item" key={entry.id}><div><span className={`record-status${entry.published ? '' : ' draft'}`}>{entry.published ? 'PUBLISHED' : 'DRAFT'}</span><h4>{entry.role_title}</h4><p>{entry.organization}{entry.location ? ` · ${entry.location}` : ''}</p><small>{formatDateRange(entry.start_date, entry.end_date, entry.is_current)}{entry.employment_type ? ` · ${entry.employment_type}` : ''}</small></div><div className="record-actions"><button type="button" onClick={() => setExperienceForm(entry)}>Edit</button><button type="button" onClick={() => onDeleteExperience(entry.id)}>Delete</button></div></article>)}</div> : !experienceForm && <div className="record-empty">No experience entries yet. Add a role to show your work history.</div>}
    </section>
    <section className="records-panel"><div className="records-heading"><div><h3>Awards &amp; certifications</h3><p>Add credentials, awards, and certificates you have earned.</p></div><button className="button button-dark" onClick={() => setCredentialForm({})}><Icon name="plus" size={15} /> Add credential</button></div>
      {credentialForm && <CredentialForm key={credentialForm.id || 'new-credential'} entry={credentialForm} saving={saving} onSubmit={onSaveCredential} onCancel={() => setCredentialForm(null)} />}
      {credentials.length ? <div className="credential-admin-list">{credentials.map((entry) => <article className="credential-admin-item" key={entry.id}>{entry.image_url && <img src={entry.image_url} alt="" />}<div><span className={`record-status${entry.published ? '' : ' draft'}`}>{entry.published ? entry.kind.toUpperCase() : 'DRAFT'}</span><h4>{entry.title}</h4>{entry.issuer && <p>{entry.issuer}</p>}<small>{entry.issued_on ? formatMonthYear(entry.issued_on) : ''}{entry.expires_on ? ` · Expires ${formatMonthYear(entry.expires_on)}` : ''}</small></div><div className="record-actions"><button type="button" onClick={() => setCredentialForm(entry)}>Edit</button><button type="button" onClick={() => onDeleteCredential(entry.id)}>Delete</button></div></article>)}</div> : !credentialForm && <div className="record-empty">No awards or certificates yet. Add one when you are ready.</div>}
    </section>
  </div>;
}

function ProjectCatalog({ projects, onAdd, onView, onEdit, onDelete }) {
  return <div className="manager-body">
    <div className="project-catalog-heading"><button className="button button-dark" onClick={onAdd}><Icon name="plus" size={16} /> Add project</button></div>
    {projects.length ? <div className="project-admin-list">{projects.map((project) => <article className="project-admin-card" key={project.id}>
      <img className="project-admin-image" src={project.images?.[0]} alt={`${project.title} cover`} />
      <div className="project-admin-info"><div className="project-admin-status">{project.published ? 'PUBLISHED' : 'DRAFT'}</div><h4>{project.title}</h4><p>{project.summary}</p><div className="tag-list">{(project.tags || []).slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div></div>
      <div className="project-admin-actions"><button className="button button-outline" onClick={() => onView(project)}>View portfolio</button><button className="button button-dark" onClick={() => onEdit(project)}>Edit portfolio</button><button className="delete-project-link" onClick={() => onDelete(project.id)}>Delete project</button></div>
    </article>)}</div> : <div className="project-empty-state"><div className="empty-icon"><Icon name="image" size={24} /></div><h4>Your portfolio starts here</h4><p>Add a project to show your work, tools, languages, and images.</p><button className="button button-dark" onClick={onAdd}><Icon name="plus" size={16} /> Add your first project</button></div>}
  </div>;
}

function ProjectEditor({ project, saving, onSubmit, onCancel, onImagesSelected }) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedPreviews, setSelectedPreviews] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const existingImages = project?.images || [];
  const existingImageCount = existingImages.length;
  const imageSlots = Math.max(0, 8 - existingImageCount);
  const totalImageCount = existingImageCount + selectedImages.length;
  const imagesValid = totalImageCount >= 1 && totalImageCount <= 8;
  useEffect(() => () => selectedPreviews.forEach((preview) => URL.revokeObjectURL(preview)), [selectedPreviews]);
  function chooseImages(event) {
    const files = Array.from(event.target.files || []);
    setSelectedImages(files);
    setSelectedPreviews(files.map((file) => URL.createObjectURL(file)));
    setCoverIndex(0);
    onImagesSelected();
  }
  return <div className="manager-body project-editor-page">
    <button className="back-link" onClick={onCancel}>← Back to projects</button>
    <div className="manager-section-title"><div><div className="eyebrow">{project ? 'EDIT PROJECT' : 'NEW PROJECT'}</div><h3>{project ? 'Edit your project' : 'Add a project'}</h3><p>{project ? 'Update the details people see in your portfolio.' : 'Add the details, links, tools, and images for this project.'}</p><p className="fifo-note">Projects appear in the order added, oldest first.</p></div></div>
    <form key={project?.id || 'new'} className="edit-form project-edit-form" onSubmit={onSubmit}>
      {project && <input type="hidden" name="id" value={project.id} />}
      <div className="form-grid">
        <label className="full">Project name<input name="title" required placeholder="For example, Northstar" defaultValue={project?.title || ''} /></label>
        <label className="full">Short summary<input name="summary" required placeholder="What did you make, and who is it for?" defaultValue={project?.summary || ''} /></label>
        <label className="full">Project details<textarea name="description" rows="5" placeholder="Describe the project, your role, and what you made." defaultValue={project?.description || ''} /></label>
        <label>Live project link <small>Optional</small><input type="url" name="project_url" placeholder="https://" defaultValue={project?.project_url || ''} /></label>
        <label>Source code link <small>Optional</small><input type="url" name="source_url" placeholder="https://" defaultValue={project?.source_url || ''} /></label>
        <label>Tools used <small>Separate each with a comma</small><input name="tools" placeholder="Figma, React" defaultValue={project?.tools?.join(', ') || ''} /></label>
        <label>Languages <small>Separate each with a comma</small><input name="languages" placeholder="TypeScript, Python" defaultValue={project?.languages?.join(', ') || ''} /></label>
        <label className="upload-zone full"><Icon name="image" /><span>{selectedImages.length ? `${selectedImages.length} new image${selectedImages.length === 1 ? '' : 's'} selected` : project ? imageSlots ? `Add images (${imageSlots} ${imageSlots === 1 ? 'slot' : 'slots'} available)` : 'All 8 image slots are used' : 'Choose project images'}<small>{selectedImages.length ? 'Choose files again to replace this selection.' : 'Add at least 1 image, up to 8 total · JPG, PNG, WebP, or AVIF · Up to 10 MB each'}</small></span><input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={Boolean(project && imageSlots === 0)} onChange={chooseImages} /></label>
        {!imagesValid && <p className="image-selection-error full">{totalImageCount === 0 ? 'Add at least 1 project image before saving.' : 'A project can have up to 8 images. Choose fewer files and try again.'}</p>}
        {totalImageCount > 0 && <div className="project-image-picker full"><div className="project-image-picker-heading"><strong>Choose a cover image</strong><small>This image appears first in your portfolio and project list.</small></div><div className="project-image-options">{existingImages.map((src, index) => <label className={`project-image-choice${coverIndex === index ? ' selected' : ''}`} key={`existing-${index}`}><input type="radio" name="cover_index" value={index} checked={coverIndex === index} onChange={() => setCoverIndex(index)} /><img src={src} alt={`${project?.title || 'Project'} view ${index + 1}`} /><span>{coverIndex === index ? 'Cover image' : 'Set as cover'}</span></label>)}{selectedPreviews.map((src, index) => { const imageIndex = existingImageCount + index; return <label className={`project-image-choice${coverIndex === imageIndex ? ' selected' : ''}`} key={`new-${index}`}><input type="radio" name="cover_index" value={imageIndex} checked={coverIndex === imageIndex} onChange={() => setCoverIndex(imageIndex)} /><img src={src} alt={`New project preview ${index + 1}`} /><span>{coverIndex === imageIndex ? 'Cover image' : 'Set as cover'}</span></label>; })}</div></div>}
        <div className="check-row"><label><input name="published" type="checkbox" defaultChecked={project ? Boolean(project.published) : true} /> Publish project</label></div>
      </div>
      <div className="project-form-actions"><button type="button" className="button button-outline" onClick={onCancel}>Cancel</button><button className="button button-dark" disabled={saving || !imagesValid}>{saving ? 'Saving…' : project ? 'Save changes' : 'Add project'} <Icon name="arrow" size={15} /></button></div>
    </form>
  </div>;
}
function ProjectDetails({ project, onBack, onEdit }) {
  if (!project) return null;
  return <div className="manager-body project-details-page">
    <button className="back-link" onClick={onBack}>← Back to projects</button>
    <div className="project-detail-heading"><div><div className="eyebrow">{project.published ? 'PUBLISHED PROJECT' : 'DRAFT PROJECT'}</div><h2>{project.title}</h2><p>{project.summary}</p></div><div className="project-detail-actions"><button className="button button-dark" onClick={() => onEdit(project)}>Edit portfolio</button></div></div>
    <div className="project-detail-images">{(project.images || []).map((src, index) => <img key={`${src}-${index}`} src={src} alt={`${project.title} view ${index + 1}`} />)}</div>
    <div className="project-detail-copy"><section><div className="eyebrow">ABOUT THE PROJECT</div><p>{project.description || 'No project details have been added yet.'}</p></section><aside>
      {project.tools?.length > 0 && <div><div className="eyebrow">TOOLS</div><div className="tag-list">{project.tools.map((item) => <span key={item}>{item}</span>)}</div></div>}
      {project.languages?.length > 0 && <div><div className="eyebrow">LANGUAGES</div><div className="tag-list">{project.languages.map((item) => <span key={item}>{item}</span>)}</div></div>}
      {project.project_url && <a className="text-link" href={project.project_url} target="_blank" rel="noreferrer">Open live project <Icon name="arrow" size={15} /></a>}
      {project.source_url && <a className="text-link" href={project.source_url} target="_blank" rel="noreferrer">View source code <Icon name="arrow" size={15} /></a>}
    </aside></div>
  </div>;
}

function App() {
  const [profile, setProfile] = useState(defaultProfile);
  const [settings, setSettings] = useState(defaultSettings);
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [activities, setActivities] = useState([]);
  const [experienceForm, setExperienceForm] = useState(null);
  const [credentialForm, setCredentialForm] = useState(null);
  const [skillForm, setSkillForm] = useState(null);
  const [educationForm, setEducationForm] = useState(null);
  const [activityForm, setActivityForm] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [notice, setNotice] = useState('');
  const [admin, setAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [projectFilter, setProjectFilter] = useState('All work');
  const [landingPortfolioTab, setLandingPortfolioTab] = useState('work');
  const [selectedWorkId, setSelectedWorkId] = useState(null);
  const [adminPage, setAdminPage] = useState('list');
  const [selectedProject, setSelectedProject] = useState(null);
  const [focusedProject, setFocusedProject] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [backgroundPreview, setBackgroundPreview] = useState('');

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let alive = true;
    const loadingStartedAt = Date.now();
    async function loadPortfolio() {
      const [, s, projectResult, experienceResult, credentialResult, skillsResult, educationResult, activitiesResult] = await Promise.all([
        supabase.from('profiles').select('*').limit(1).maybeSingle().then((result) => {
          if (alive && result.data) {
            setProfile({ ...defaultProfile, ...result.data });
            setSocialLinks(normalizeSocialLinks(result.data.social_links));
          }
          return result;
        }),
        supabase.from('ui_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('projects').select('*, project_images(*), project_technologies(technologies(*))').order('created_at', { ascending: true }),
        supabase.from('experiences').select('*').order('start_date', { ascending: false }),
        supabase.from('awards_certificates').select('*').order('issued_on', { ascending: false, nullsFirst: false }),
        supabase.from('portfolio_skills').select('*').order('display_order').order('name'),
        supabase.from('education').select('*').order('display_order').order('start_date', { ascending: false }),
        supabase.from('activities').select('*').order('created_at', { ascending: false }),
      ]);
      if (!alive) return;
      if (s.data) setSettings({ ...defaultSettings, ...s.data });
      const projectRows = Array.isArray(projectResult.data)
        ? projectResult.data
        : projectResult.data && typeof projectResult.data === 'object' && projectResult.data.id
          ? [projectResult.data]
          : [];
      setProjects(projectRows.map((item) => {
        const technologies = (item.project_technologies || []).map((link) => link.technologies).filter(Boolean);
        return { ...item, year: item.created_at ? String(new Date(item.created_at).getFullYear()) : '', images: (item.project_images || []).sort((a, b) => a.display_order - b.display_order).map((img) => supabase.storage.from('portfolio-images').getPublicUrl(img.storage_path).data.publicUrl), tags: technologies.map((tech) => tech.name), tools: technologies.filter((tech) => tech.kind === 'tool' || tech.kind === 'framework').map((tech) => tech.name), languages: technologies.filter((tech) => tech.kind === 'language').map((tech) => tech.name) };
      }));
      if (projectResult.error) setNotice('Projects could not be loaded from the portfolio database.');
      else if (projectResult.data != null && !Array.isArray(projectResult.data) && !projectResult.data?.id) setNotice('Projects returned an unexpected response. Check the projects query and refresh the page.');
      if (experienceResult.data) setExperiences(experienceResult.data);
      if (credentialResult.data) setCredentials(credentialResult.data.map((item) => ({ ...item, image_url: item.image_path ? supabase.storage.from('portfolio-images').getPublicUrl(item.image_path).data.publicUrl : '' })));
      if (skillsResult.data) setSkills(skillsResult.data);
      if (educationResult.data) setEducation(educationResult.data);
      if (activitiesResult.data) setActivities(activitiesResult.data.map((item) => ({ ...item, media_urls: (item.media_paths || []).map((path) => supabase.storage.from('portfolio-images').getPublicUrl(path).data.publicUrl) })));
      if (experienceResult.error || credentialResult.error || skillsResult.error || educationResult.error || activitiesResult.error) setNotice('Some portfolio sections could not be loaded. Apply the latest database migration.');
      const remainingLoadingTime = Math.max(0, 2400 - (Date.now() - loadingStartedAt));
      if (remainingLoadingTime) await new Promise((resolve) => setTimeout(resolve, remainingLoadingTime));
      if (alive) setLoading(false);
    }
    loadPortfolio();
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session && alive) await verifyAdmin();
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (!session) setAdmin(false); });
    return () => { alive = false; listener.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const targets = document.querySelectorAll('#work .section-heading, #work .work-project-row, #work .work-preview-card, .skills-section, .education-section, .experience-section, .credentials-section, .activities-section, .contact-section');
    targets.forEach((target) => target.classList.add('reveal-item'));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    targets.forEach((target) => { if (!target.classList.contains('is-visible')) observer.observe(target); });
    return () => observer.disconnect();
  }, [projects, experiences, credentials, skills, education, activities, loading]);

  async function verifyAdmin() {
    if (!supabase) return false;
    const { data } = await supabase.rpc('is_portfolio_admin');
    setAdmin(Boolean(data));
    return Boolean(data);
  }

  const publicProjects = projects.filter((project) => project.published && project.images?.length);
  const projectFilters = [...new Set(publicProjects.flatMap((project) => project.tags || []))].slice(0, 6);
  const filteredWork = projectFilter === 'All work' ? publicProjects : publicProjects.filter((project) => project.tags?.includes(projectFilter));
  const selectedWork = filteredWork.find((project) => project.id === selectedWorkId) || filteredWork[0];
  const nameParts = profile.full_name.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || '';
  const initials = nameParts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const bio = profile.bio.trim();
  const portfolioSkills = [...new Set(publicProjects.flatMap((project) => project.tags || []))].slice(0, 4);
  const contactLinks = normalizeSocialLinks(profile.social_links);
  const hasContact = Boolean(profile.email || profile.phone_number || profile.website_url || contactLinks.length);
  const publicExperiences = experiences.filter((entry) => entry.published);
  const publicCredentials = credentials.filter((entry) => entry.published);
  const publicSkills = skills.filter((entry) => entry.published);
  const publicEducation = education.filter((entry) => entry.published);
  const publicActivities = activities.filter((entry) => entry.published);
  const cssVars = { '--paper': settings.background_color, '--surface': settings.surface_color, '--ink': settings.text_color, '--forest': settings.primary_color, '--clay': settings.secondary_color, '--muted': settings.muted_color, '--portfolio-background': settings.background_image_url ? `linear-gradient(${settings.background_color}ee, ${settings.background_color}ee), url("${settings.background_image_url}")` : 'none', '--heading-font': `'${settings.header_font}', Georgia, serif`, '--body-font': `'${settings.body_font}', sans-serif` };

  async function signIn(event) {
    event.preventDefault(); setSaving(true); setNotice('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setNotice('Sign-in failed. The owner account must exist and be confirmed in Supabase Auth, with a valid password.');
      else if (await verifyAdmin()) { setShowLogin(false); setShowManager(true); }
      else { await supabase.auth.signOut(); setNotice('This account is not authorized for portfolio administration.'); }
    } catch {
      setNotice('Could not reach Supabase Auth. Check your connection and try again.');
    } finally {
      setEmail(''); setPassword(''); setSaving(false);
    }
  }

  function openLogin() { setEmail(''); setPassword(''); setNotice(''); setShowLogin(true); }
  function closeLogin() { setEmail(''); setPassword(''); setNotice(''); setShowLogin(false); }
  async function signOut() { await supabase.auth.signOut(); setAdmin(false); setShowManager(false); }

  async function uploadPortfolioImage(file, path) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) throw new Error('Choose a JPG, PNG, WebP, or AVIF image.');
    if (file.size > 10 * 1024 * 1024) throw new Error('Images must be 10 MB or smaller.');
    const { error } = await supabase.storage.from('portfolio-images').upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw new Error(error.message);
    return supabase.storage.from('portfolio-images').getPublicUrl(path).data.publicUrl;
  }

  function resetProfileForm(form) {
    ['full_name', 'headline', 'bio', 'location', 'phone_number', 'email', 'website_url'].forEach((name) => {
      if (form.elements[name]) form.elements[name].value = profile[name] || '';
    });
    form.elements.avatar_file.value = '';
    setAvatarPreview('');
    setSocialLinks(normalizeSocialLinks(profile.social_links));
  }

  async function saveProfile(form) {
    setSaving(true); setNotice('');
    try {
      const payload = Object.fromEntries(new FormData(form));
      const avatarFile = form.elements.avatar_file.files[0];
      delete payload.avatar_file;
      const savedSocialLinks = socialLinks.map((link) => ({ label: link.label.trim(), url: link.url.trim() })).filter((link) => link.label || link.url);
      if (savedSocialLinks.some((link) => !link.label || !link.url)) throw new Error('Add both a platform name and a link, or remove the empty row.');
      if (savedSocialLinks.some((link) => {
        try { const url = new URL(link.url); return !['http:', 'https:'].includes(url.protocol); }
        catch { return true; }
      })) throw new Error('Enter a complete social profile link starting with https://.');
      let avatarUrl = profile.avatar_url || null;
      if (avatarFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Your session expired. Sign in again to upload an image.');
        avatarUrl = await uploadPortfolioImage(avatarFile, `profiles/${user.id}/avatar`);
      }
      const { data, error } = await supabase.from('profiles').upsert({ ...(profile.id ? { id: profile.id } : {}), ...payload, avatar_url: avatarUrl, social_links: savedSocialLinks }, { onConflict: 'id' }).select().single();
      if (error) throw new Error(error.message);
      setProfile({ ...profile, ...data }); setSocialLinks(savedSocialLinks); form.elements.avatar_file.value = ''; setAvatarPreview(''); setNotice('Profile saved.');
    } catch (error) { setNotice(error.message || 'Could not save the profile.'); }
    finally { setSaving(false); }
  }

  async function saveSettings(form) {
    setSaving(true); setNotice('');
    try {
      const payload = Object.fromEntries(new FormData(form));
      const backgroundFile = form.elements.background_image_file.files[0];
      delete payload.background_image_file;
      if (backgroundFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Your session expired. Sign in again to upload an image.');
        payload.background_image_url = await uploadPortfolioImage(backgroundFile, `settings/${user.id}/background`);
      }
      const { error } = await supabase.from('ui_settings').upsert({ id: 1, ...payload }, { onConflict: 'id' });
      if (error) throw new Error(error.message);
      setSettings({ ...settings, ...payload }); form.elements.background_image_file.value = ''; setBackgroundPreview(''); setNotice('Appearance saved.');
    } catch (error) { setNotice(error.message || 'Could not save appearance settings.'); }
    finally { setSaving(false); }
  }

  async function saveExperience(event) {
    event.preventDefault(); setSaving(true); setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const currentRole = values.is_current === 'on';
    const payload = { role_title: values.role_title.trim(), organization: values.organization.trim(), employment_type: values.employment_type || '', workplace_type: values.workplace_type || '', location: values.location.trim(), start_date: values.start_date, end_date: currentRole ? null : values.end_date || null, is_current: currentRole, description: values.description.trim(), published: values.published === 'on', display_order: experienceForm?.display_order ?? experiences.length, updated_at: new Date().toISOString() };
    try {
      const { data, error } = await supabase.from('experiences').upsert({ ...(values.id ? { id: values.id } : {}), ...payload }, { onConflict: 'id' }).select().single();
      if (error) throw error;
      setExperiences((current) => [...current.filter((item) => item.id !== data.id), data].sort((a, b) => b.start_date.localeCompare(a.start_date)));
      setExperienceForm(null); setNotice(values.id ? 'Experience updated.' : 'Experience added.');
    } catch (error) { setNotice(error.message || 'Could not save this experience.'); }
    finally { setSaving(false); }
  }

  async function saveCredential(event) {
    event.preventDefault(); setSaving(true); setNotice('');
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const file = form.elements.credential_image.files[0];
    const payload = { kind: values.kind, title: values.title.trim(), issuer: values.issuer.trim(), description: values.description.trim(), issued_on: values.issued_on || null, expires_on: values.expires_on || null, credential_id: values.credential_id.trim(), credential_url: values.credential_url.trim(), image_path: credentialForm?.image_path || '', display_order: credentialForm?.display_order ?? credentials.length, published: values.published === 'on', updated_at: new Date().toISOString() };
    try {
      let { data, error } = await supabase.from('awards_certificates').upsert({ ...(values.id ? { id: values.id } : {}), ...payload }, { onConflict: 'id' }).select().single();
      if (error) throw error;
      if (file) {
        const imagePath = `credentials/${data.id}/certificate`;
        await uploadPortfolioImage(file, imagePath);
        const result = await supabase.from('awards_certificates').update({ image_path: imagePath, updated_at: new Date().toISOString() }).eq('id', data.id).select().single();
        if (result.error) throw result.error;
        data = result.data;
      }
      const saved = { ...data, image_url: data.image_path ? supabase.storage.from('portfolio-images').getPublicUrl(data.image_path).data.publicUrl : '' };
      setCredentials((current) => [...current.filter((item) => item.id !== saved.id), saved].sort((a, b) => (b.issued_on || '').localeCompare(a.issued_on || '')));
      setCredentialForm(null); form.reset(); setNotice(values.id ? 'Credential updated.' : 'Credential added.');
    } catch (error) { setNotice(error.message || 'Could not save this credential.'); }
    finally { setSaving(false); }
  }

  async function saveSkill(event) {
    event.preventDefault(); setSaving(true); setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const payload = { name: values.name.trim(), category: values.category.trim(), proficiency: values.proficiency, description: values.description.trim(), published: values.published === 'on', display_order: skillForm.display_order ?? skills.length, updated_at: new Date().toISOString() };
    try {
      const { data, error } = await supabase.from('portfolio_skills').upsert({ ...(skillForm.id ? { id: skillForm.id } : {}), ...payload }, { onConflict: 'id' }).select().single();
      if (error) throw error;
      setSkills((current) => [...current.filter((item) => item.id !== data.id), data].sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)));
      setSkillForm(null); setNotice(skillForm.id ? 'Skill updated.' : 'Skill added.');
    } catch (error) { setNotice(error.message || 'Could not save this skill.'); }
    finally { setSaving(false); }
  }

  async function saveEducation(event) {
    event.preventDefault(); setSaving(true); setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const currentStudy = values.is_current === 'on';
    const payload = { institution: values.institution.trim(), degree: values.degree.trim(), field_of_study: values.field_of_study.trim(), start_date: values.start_date || null, end_date: currentStudy ? null : values.end_date || null, is_current: currentStudy, description: values.description.trim(), activities: values.activities.trim(), related_skills: values.related_skills.split(',').map((name) => name.trim()).filter(Boolean), display_order: educationForm.display_order ?? education.length, published: values.published === 'on', updated_at: new Date().toISOString() };
    try {
      const { data, error } = await supabase.from('education').upsert({ ...(educationForm.id ? { id: educationForm.id } : {}), ...payload }, { onConflict: 'id' }).select().single();
      if (error) throw error;
      setEducation((current) => [...current.filter((item) => item.id !== data.id), data].sort((a, b) => a.display_order - b.display_order || (b.start_date || '').localeCompare(a.start_date || '')));
      setEducationForm(null); setNotice(educationForm.id ? 'Education updated.' : 'Education added.');
    } catch (error) { setNotice(error.message || 'Could not save this education entry.'); }
    finally { setSaving(false); }
  }

  async function saveActivity(event, mediaState) {
    event.preventDefault(); setSaving(true); setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const content = values.content.trim();
    if (!content && !mediaState.keptPaths.length && !mediaState.newFiles.length) { setNotice('Write an update or add at least one photo before posting.'); setSaving(false); return; }
    try {
      const id = values.id || crypto.randomUUID();
      const newPaths = [];
      for (const [index, file] of mediaState.newFiles.entries()) {
        const extension = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'image';
        const path = `activities/${id}/${Date.now()}-${index}.${extension}`;
        await uploadPortfolioImage(file, path);
        newPaths.push(path);
      }
      const payload = { content, media_paths: [...mediaState.keptPaths, ...newPaths], published: values.published === 'on', updated_at: new Date().toISOString() };
      const { data, error } = await supabase.from('activities').upsert({ id, ...payload }, { onConflict: 'id' }).select().single();
      if (error) throw error;
      const removedPaths = (activityForm?.media_paths || []).filter((path) => !payload.media_paths.includes(path));
      if (removedPaths.length) await supabase.storage.from('portfolio-images').remove(removedPaths);
      const saved = { ...data, media_urls: data.media_paths.map((path) => supabase.storage.from('portfolio-images').getPublicUrl(path).data.publicUrl) };
      setActivities((current) => [saved, ...current.filter((item) => item.id !== saved.id)].sort((a, b) => b.created_at.localeCompare(a.created_at)));
      setActivityForm(null); setNotice(values.id ? 'Post updated.' : 'Post published.');
    } catch (error) { setNotice(error.message || 'Could not save your post.'); }
    finally { setSaving(false); }
  }

  async function deleteSkill(id) {
    if (!window.confirm('Delete this skill?')) return;
    const { error } = await supabase.from('portfolio_skills').delete().eq('id', id);
    if (error) setNotice(error.message); else { setSkills((current) => current.filter((item) => item.id !== id)); setNotice('Skill deleted.'); }
  }

  async function deleteEducation(id) {
    if (!window.confirm('Delete this education entry?')) return;
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (error) setNotice(error.message); else { setEducation((current) => current.filter((item) => item.id !== id)); setNotice('Education entry deleted.'); }
  }

  async function deleteActivity(id) {
    if (!window.confirm('Delete this post?')) return;
    const post = activities.find((item) => item.id === id);
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) setNotice(error.message); else {
      if (post?.media_paths?.length) await supabase.storage.from('portfolio-images').remove(post.media_paths);
      setActivities((current) => current.filter((item) => item.id !== id)); setNotice('Post deleted.');
    }
  }

  async function deleteExperience(id) {
    if (!window.confirm('Delete this experience entry?')) return;
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (error) setNotice(error.message); else { setExperiences((current) => current.filter((item) => item.id !== id)); setNotice('Experience deleted.'); }
  }

  async function deleteCredential(id) {
    if (!window.confirm('Delete this award or certification?')) return;
    const { error } = await supabase.from('awards_certificates').delete().eq('id', id);
    if (error) setNotice(error.message); else { setCredentials((current) => current.filter((item) => item.id !== id)); setNotice('Credential deleted.'); }
  }

  async function saveProject(event) {
    event.preventDefault(); setSaving(true); setNotice('');
    const form = event.currentTarget; const values = Object.fromEntries(new FormData(form));
    const files = Array.from(form.elements.images.files || []);
    const id = values.id || undefined;
    const existingImageCount = editProject?.images?.length || 0;
    if (existingImageCount + files.length < 1) { setNotice('Add at least 1 image to create this project.'); setSaving(false); return; }
    if (files.length > 8 || existingImageCount + files.length > 8) { setNotice(`A project can have up to 8 images. There are ${Math.max(0, 8 - existingImageCount)} image slots left.`); setSaving(false); return; }
    if (files.some((file) => file.size > 10 * 1024 * 1024)) { setNotice('Each image must be 10 MB or smaller.'); setSaving(false); return; }
    const { data: existingProjects, error: slugLookupError } = await supabase.from('projects').select('id, slug');
    if (slugLookupError) { setNotice(slugLookupError.message); setSaving(false); return; }
    const baseSlug = String(values.title || 'project').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
    const usedSlugs = new Set((existingProjects || []).filter((item) => item.id !== id).map((item) => item.slug));
    let slug = baseSlug;
    let suffix = 2;
    while (usedSlugs.has(slug)) { slug = `${baseSlug}-${suffix}`; suffix += 1; }
    const { data: project, error } = await supabase.from('projects').upsert({ ...(id ? { id } : {}), title: values.title, slug, summary: values.summary, description: values.description, project_url: values.project_url || null, source_url: values.source_url || null, published: values.published === 'on' }, { onConflict: 'id' }).select().single();
    if (error) { setNotice(error.message); setSaving(false); return; }
    if (files.length) {
      const uploaded = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index]; const path = `${project.id}/${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
        const result = await supabase.storage.from('portfolio-images').upload(path, file, { upsert: false });
        if (result.error) { setNotice(result.error.message); setSaving(false); return; }
        uploaded.push({ project_id: project.id, storage_path: path, alt_text: project.title, display_order: existingImageCount + index });
      }
      const imageResult = await supabase.from('project_images').insert(uploaded);
      if (imageResult.error) { setNotice(imageResult.error.message); setSaving(false); return; }
    }
    const { data: allImageRows, error: imageListError } = await supabase.from('project_images').select('*').eq('project_id', project.id).order('display_order', { ascending: true });
    if (imageListError) { setNotice(imageListError.message); setSaving(false); return; }
    if (allImageRows.length) {
      const requestedCoverIndex = Number.parseInt(values.cover_index, 10);
      const safeCoverIndex = Number.isInteger(requestedCoverIndex) && requestedCoverIndex >= 0 && requestedCoverIndex < allImageRows.length ? requestedCoverIndex : 0;
      const orderedRows = [allImageRows[safeCoverIndex], ...allImageRows.filter((_, index) => index !== safeCoverIndex)];
      for (let index = 0; index < orderedRows.length; index += 1) {
        const { error: orderError } = await supabase.from('project_images').update({ display_order: index }).eq('id', orderedRows[index].id);
        if (orderError) { setNotice(orderError.message); setSaving(false); return; }
      }
    }
    const names = [
      ...String(values.tools || '').split(',').map((name) => ({ name: name.trim(), kind: 'tool' })),
      ...String(values.languages || '').split(',').map((name) => ({ name: name.trim(), kind: 'language' })),
    ].filter((item) => item.name);
    await supabase.from('project_technologies').delete().eq('project_id', project.id);
    for (const item of names) {
      const { data: tech } = await supabase.from('technologies').upsert(item, { onConflict: 'name,kind' }).select().single();
      if (tech) await supabase.from('project_technologies').insert({ project_id: project.id, technology_id: tech.id });
    }
    setNotice('Project saved.'); setSaving(false); setEditProject(null); setSelectedProject(null); setAdminPage('list'); form.reset(); await refreshProjects();
  }

  async function refreshProjects() {
    const { data } = await supabase.from('projects').select('*, project_images(*), project_technologies(technologies(*))').order('created_at', { ascending: true });
    const rows = Array.isArray(data) ? data : data && typeof data === 'object' && data.id ? [data] : [];
    setProjects(rows.map((item) => {
      const technologies = (item.project_technologies || []).map((link) => link.technologies).filter(Boolean);
      return { ...item, year: item.created_at ? String(new Date(item.created_at).getFullYear()) : '', images: (item.project_images || []).sort((a, b) => a.display_order - b.display_order).map((img) => supabase.storage.from('portfolio-images').getPublicUrl(img.storage_path).data.publicUrl), tags: technologies.map((tech) => tech.name), tools: technologies.filter((tech) => tech.kind === 'tool' || tech.kind === 'framework').map((tech) => tech.name), languages: technologies.filter((tech) => tech.kind === 'language').map((tech) => tech.name) };
    }));
  }

  async function deleteProject(id) {
    if (!window.confirm('Remove this project from your portfolio?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) setNotice(error.message); else { setNotice('Project removed.'); await refreshProjects(); }
  }

  return (
    <main className="portfolio" style={cssVars}>
      {loading && <PortfolioLoader profile={profile} settings={settings} />}
      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><Icon name="close" size={14} /></button></div>}
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label={profile.full_name ? `${profile.full_name} home` : 'Portfolio home'}>{initials && <span className="wordmark-mark"><PortfolioLogo /></span>}<span>{profile.full_name && <strong>{profile.full_name}</strong>}{profile.headline && <small>{profile.headline}</small>}</span></a>
        <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu"><Icon name={mobileMenu ? 'close' : 'menu'} /></button>
        <nav className={mobileMenu ? 'nav open' : 'nav'}>
          {publicProjects.length > 0 && <a href="#work" onClick={() => { setLandingPortfolioTab('work'); setMobileMenu(false); }}>Work <span>({String(publicProjects.length).padStart(2, '0')})</span></a>}
          {publicExperiences.length > 0 && <a href="#experience" onClick={() => setMobileMenu(false)}>Experience</a>}
          {publicEducation.length > 0 && <a href="#education" onClick={() => setMobileMenu(false)}>Education</a>}
          {publicSkills.length > 0 && <a href="#skills" onClick={() => setMobileMenu(false)}>Skills</a>}
          {publicCredentials.length > 0 && <a href="#credentials" onClick={() => setMobileMenu(false)}>Awards</a>}
          {publicActivities.length > 0 && <a href="#work" onClick={() => { setLandingPortfolioTab('activities'); setMobileMenu(false); }}>Activities</a>}
          {hasContact && <a href="#contact" onClick={() => setMobileMenu(false)}>Contact</a>}
          {admin ? <button className="admin-link" onClick={() => setShowManager(true)}>Manage portfolio <span className="admin-dot" /></button> : <button className="admin-link" onClick={openLogin}>Admin</button>}
        </nav>
      </header>

      <section className={`hero profile-hero${profile.avatar_url || initials ? '' : ' hero-no-photo'}`} id="top">
        <div className="hero-vector-scene" aria-hidden="true">
          <svg className="hero-vector-lines" viewBox="0 0 920 620" fill="none" preserveAspectRatio="xMidYMid meet">
            <path className="vector-loop vector-loop-one" d="M95 360C147 170 327 76 486 120c160 44 251 224 166 353-73 110-232 149-376 92C137 514 58 447 95 360Z" />
            <path className="vector-loop vector-loop-two" d="M230 511c-79-117-56-286 74-371 130-85 311-46 381 84 69 130 10 291-127 348-135 57-250 33-328-61Z" />
            <path className="vector-orbit" d="M132 450c91-199 306-311 526-244" />
            <circle className="vector-node vector-node-one" cx="185" cy="197" r="7" />
            <circle className="vector-node vector-node-two" cx="688" cy="359" r="5" />
            <circle className="vector-node vector-node-three" cx="350" cy="548" r="4" />
            <path className="vector-constellation" d="M185 197 326 274l144-89 218 174M326 274l24 274m120-363 76 188 142 62" />
            <circle className="vector-constellation-ring" cx="470" cy="185" r="19" />
            <rect className="vector-diamond" x="659" y="479" width="17" height="17" rx="2" transform="rotate(25 659 479)" />
            <path className="vector-spark" d="m739 130 8 22 22 8-22 8-8 22-8-22-22-8 22-8 8-22Z" />
          </svg>
          <span className="hero-vector-glow hero-vector-glow-one" />
          <span className="hero-vector-glow hero-vector-glow-two" />
        </div>
        <div className="hero-copy">
          {(profile.full_name || profile.headline) && <div className="eyebrow"><span className="eyebrow-dot" /> PORTFOLIO PROFILE</div>}
          {(profile.full_name || profile.headline) && <h1>{profile.full_name || profile.headline}</h1>}
          {profile.full_name && profile.headline && <p className="hero-role">{profile.headline}</p>}
          {bio && <p className="hero-intro">{bio}</p>}
          <div className="hero-actions">{publicProjects.length > 0 && <a className="button button-dark" href="#work" onClick={() => setLandingPortfolioTab('work')}>Explore my work <Icon name="down" size={16} /></a>}{profile.email && <a className="text-link" href={`mailto:${profile.email}`}>Get in touch <Icon name="arrow" size={15} /></a>}</div>
          {(profile.location || portfolioSkills.length > 0) && <div className="hero-meta">
            {profile.location && <div className="hero-location-meta"><span>BASED IN</span><strong>{profile.location}</strong></div>}
            {portfolioSkills.length > 0 && <div className="hero-tools-meta"><span>PROJECT TOOLS</span><div>{portfolioSkills.map((tool) => <span className="hero-tool-chip" key={tool}>{tool}</span>)}</div></div>}
          </div>}
          {contactLinks.length > 0 && <div className="hero-social-links"><span className="hero-social-label">CONNECT</span>{contactLinks.slice(0, 4).map((link) => <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">{link.label}<Icon name="arrow" size={12} /></a>)}</div>}
        </div>
        {(profile.avatar_url || initials) && <div className="hero-profile-visual"><div className="hero-profile-ring" /><span className="hero-orbit-dot" aria-hidden="true" />{profile.avatar_url ? <img className="hero-profile-photo" src={profile.avatar_url} alt={`${profile.full_name || 'Profile'} portrait`} fetchPriority="high" /> : <div className="hero-profile-initials" aria-label={profile.full_name}><PortfolioLogo /></div>}{profile.location && <div className="hero-location-chip"><span>BASED IN</span><strong>{profile.location}</strong></div>}<span className="hero-profile-mark" aria-hidden="true"><PortfolioLogo /></span><div className="hero-visual-note"><span className="hero-note-spark"><Icon name="spark" size={15} /></span><span><strong>Curious by nature.</strong><small>Building with purpose.</small></span></div></div>}
        {(publicProjects.length > 0 || profile.bio) && <div className="scroll-hint"><span /> SCROLL TO EXPLORE</div>}
      </section>

      {(loading || publicProjects.length > 0 || publicActivities.length > 0) && <section className="work-section" id="work">
        <div className="work-toolbar"><div className="section-heading"><div><div className="eyebrow">{landingPortfolioTab === 'work' ? 'SELECTED WORK' : 'FROM THE STUDIO'}</div><h2>{landingPortfolioTab === 'work' ? (settings.header_text || (firstName ? `${firstName}’s work` : 'Projects')) : 'Activities & updates'}</h2><p>{landingPortfolioTab === 'work' ? (settings.body_text || 'A closer look at selected projects.') : 'Recent notes, milestones, and moments from my work.'}</p></div></div>
          {landingPortfolioTab === 'work' && projectFilters.length > 0 && <div className="project-filters" role="group" aria-label="Filter projects"><span>Explore by</span>{['All work', ...projectFilters].map((filter) => <button key={filter} type="button" className={projectFilter === filter ? 'active' : ''} aria-pressed={projectFilter === filter} onClick={() => { setProjectFilter(filter); setSelectedWorkId(null); }}>{filter}</button>)}</div>}
        </div>
        <div className="landing-content-tabs" role="tablist" aria-label="Portfolio content">
          <button id="work-tab" type="button" role="tab" aria-selected={landingPortfolioTab === 'work'} aria-controls="work-tab-panel" className={landingPortfolioTab === 'work' ? 'active' : ''} onClick={() => setLandingPortfolioTab('work')}>Work <span>{publicProjects.length}</span></button>
          <button id="activities-tab" type="button" role="tab" aria-selected={landingPortfolioTab === 'activities'} aria-controls="activities-tab-panel" className={landingPortfolioTab === 'activities' ? 'active' : ''} onClick={() => setLandingPortfolioTab('activities')}>Activities <span>{publicActivities.length}</span></button>
        </div>
        {landingPortfolioTab === 'work' && <div id="work-tab-panel" className="landing-content-panel" role="tabpanel" aria-labelledby="work-tab">
          {loading && <div className="loading-line"><span /> Loading projects</div>}
          {!loading && filteredWork.length > 0 && <div className="work-showcase">
            <div className="work-project-list" aria-label="Projects">
              {filteredWork.map((project, index) => <button className={`work-project-row${(selectedWork?.id === project.id) ? ' active' : ''}`} type="button" key={project.id} aria-pressed={selectedWork?.id === project.id} onClick={() => setSelectedWorkId(project.id)}>
                <span className="work-project-number">{String(index + 1).padStart(2, '0')}</span><span className="work-project-copy"><strong>{project.title}</strong>{project.summary && <small>{project.summary}</small>}{project.year && <time>{project.year}</time>}</span><Icon name="arrow" size={19} />
              </button>)}
            </div>
            {selectedWork && <article className="work-preview-card">
              <div className="work-preview-tags">{selectedWork.tags?.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <div className="work-preview-heading"><h3>{selectedWork.title}</h3>{selectedWork.year && <span>{selectedWork.year}</span>}</div>
              <button className="work-preview-image" type="button" onClick={() => setFocusedProject(selectedWork)} aria-label={`View ${selectedWork.title} case study`}>{selectedWork.images?.[0] ? <img src={selectedWork.images[0]} alt={`${selectedWork.title} preview`} /> : <div className="work-preview-placeholder" aria-hidden="true"><svg viewBox="0 0 440 270" fill="none"><circle cx="220" cy="135" r="80" /><circle cx="220" cy="135" r="111" /><path d="M79 212c57-43 98-56 141-30s73 30 141-20" /><path d="M114 75h58M268 195h58" /></svg><span>{selectedWork.title}</span></div>}<span><Icon name="arrow" size={17} /></span></button>
              {selectedWork.summary && <p>{selectedWork.summary}</p>}
              <button className="button button-dark work-case-study" type="button" onClick={() => setFocusedProject(selectedWork)}>Open case study <Icon name="arrow" size={14} /></button>
            </article>}
          </div>}
          {!loading && !publicProjects.length && <div className="empty-work">No published projects yet.</div>}
        </div>}
        {landingPortfolioTab === 'activities' && <div id="activities-tab-panel" className="landing-content-panel activities-tab-panel" role="tabpanel" aria-labelledby="activities-tab">{publicActivities.length > 0 ? <ActivitiesSection activities={publicActivities} profile={profile} embedded /> : <div className="empty-work">No activities have been shared yet.</div>}</div>}
      </section>}

      {(publicExperiences.length > 0 || publicEducation.length > 0 || publicSkills.length > 0) && <div className="career-overview-grid">
        <svg className="career-overview-vector" viewBox="0 0 1440 660" preserveAspectRatio="none" fill="none" aria-hidden="true">
          <path className="career-vector-orbit career-vector-orbit-one" d="M-45 520C132 442 151 235 310 199c179-41 232 222 411 217 178-5 201-255 397-309 142-39 235 19 374 120" />
          <path className="career-vector-orbit career-vector-orbit-two" d="M-30 584c205-108 298-269 449-248 172 24 162 224 321 221 165-3 251-223 440-239 99-8 185 26 289 101" />
          <circle className="career-vector-node" cx="310" cy="199" r="7" />
          <circle className="career-vector-node" cx="721" cy="416" r="5" />
          <circle className="career-vector-node" cx="1118" cy="107" r="6" />
          <path className="career-vector-spark" d="m1270 420 8 20 20 8-20 8-8 20-8-20-20-8 20-8 8-20Z" />
        </svg>
        <ExperienceSection experiences={publicExperiences} />
        <EducationSection education={publicEducation} />
        <SkillsSection skills={publicSkills} />
      </div>}
      <CredentialsSection credentials={publicCredentials} />
      {hasContact && <section className="contact-section" id="contact"><div className="eyebrow"><span className="eyebrow-dot" /> CONTACT</div><h2>Let’s talk.</h2><p>Reach me through the channel that works best for you.</p>{profile.email && <a className="button button-light" href={`mailto:${profile.email}`}>Email me <Icon name="arrow" size={16} /></a>}<div className="contact-details">{profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}{profile.phone_number && <a href={`tel:${profile.phone_number.replace(/[^\d+]/g, '')}`}>{profile.phone_number}</a>}{profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer">Website</a>}{contactLinks.map((link) => <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>)}</div><span className="contact-spark">✳</span></section>}
      <footer className="site-footer"><span className="footer-copyright">© {new Date().getFullYear()} {profile.full_name || 'Portfolio'}</span><a className="footer-top-link" href="#top">Back to top <Icon name="arrow" size={13} /></a></footer>
      {focusedProject && <ProjectModal key={focusedProject.id} project={focusedProject} onClose={() => setFocusedProject(null)} />}

        {showLogin && <div className="modal-backdrop" onClick={closeLogin}><form className="login-panel" autoComplete="off" onSubmit={signIn} onClick={(e) => e.stopPropagation()}><button type="button" className="modal-close" onClick={closeLogin} aria-label="Close"><Icon name="close" /></button><div className="eyebrow">PRIVATE STUDIO</div><h2>Welcome back.</h2><p>Sign in to manage your portfolio.</p><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" autoComplete="off" required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="off" required /></label><button className="button button-dark login-submit" disabled={saving}>{saving ? 'Signing in…' : 'Sign in'} <Icon name="arrow" size={15} /></button>{!supabase && <small className="config-hint">Add your Supabase URL and publishable key in <code>.env.local</code>.</small>}</form></div>}

      {showManager && admin && <div className="manager-backdrop"><aside className="manager"><div className="manager-head"><div className="eyebrow">PORTFOLIO STUDIO</div><div className="manager-head-actions"><button className="view-landing" onClick={() => { setShowManager(false); window.location.hash = 'top'; }}>View landing page</button><button className="signout" onClick={signOut}><Icon name="logout" size={15} /> Sign out</button></div></div>{adminPage === 'list' && <nav className="manager-tabs"><button className={activeTab === 'projects' ? 'active' : ''} onClick={() => { setActiveTab('projects'); setAdminPage('list'); }}>Projects <span>{projects.length}</span></button><button className={activeTab === 'experience' ? 'active' : ''} onClick={() => { setActiveTab('experience'); setAdminPage('list'); }}>Experience &amp; Awards <span>{experiences.length + credentials.length}</span></button><button className={activeTab === 'skills-education' ? 'active' : ''} onClick={() => { setActiveTab('skills-education'); setAdminPage('list'); }}>Skills &amp; Education <span>{skills.length + education.length}</span></button><button className={activeTab === 'activities' ? 'active' : ''} onClick={() => { setActiveTab('activities'); setAdminPage('list'); }}>Activities <span>{activities.length}</span></button><button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Profile</button><button className={activeTab === 'appearance' ? 'active' : ''} onClick={() => setActiveTab('appearance')}>Appearance</button></nav>}
        {activeTab === 'projects' && adminPage === 'list' && <ProjectCatalog projects={projects} onAdd={() => { setEditProject(null); setAdminPage('new'); }} onView={(project) => { setSelectedProject(project); setAdminPage('view'); }} onEdit={(project) => { setEditProject(project); setAdminPage('edit'); }} onDelete={deleteProject} />}
        {activeTab === 'projects' && (adminPage === 'new' || adminPage === 'edit') && <ProjectEditor project={adminPage === 'edit' ? editProject : null} saving={saving} onSubmit={saveProject} onCancel={() => { setEditProject(null); setAdminPage('list'); }} onImagesSelected={() => setNotice('')} />}
        {activeTab === 'projects' && adminPage === 'view' && <ProjectDetails project={selectedProject} onBack={() => setAdminPage('list')} onEdit={(project) => { setEditProject(project); setAdminPage('edit'); }} />}        {activeTab === 'experience' && <ExperienceManager experiences={experiences} credentials={credentials} experienceForm={experienceForm} setExperienceForm={setExperienceForm} credentialForm={credentialForm} setCredentialForm={setCredentialForm} saving={saving} onSaveExperience={saveExperience} onSaveCredential={saveCredential} onDeleteExperience={deleteExperience} onDeleteCredential={deleteCredential} />}
        {activeTab === 'skills-education' && <SkillsEducationManager skills={skills} education={education} skillForm={skillForm} setSkillForm={setSkillForm} educationForm={educationForm} setEducationForm={setEducationForm} saving={saving} onSaveSkill={saveSkill} onSaveEducation={saveEducation} onDeleteSkill={deleteSkill} onDeleteEducation={deleteEducation} />}
        {activeTab === 'activities' && <ActivitiesManager activities={activities} activityForm={activityForm} setActivityForm={setActivityForm} saving={saving} profile={profile} onSave={saveActivity} onDelete={deleteActivity} />}
        {activeTab === 'profile' && <ProfileEditor profile={profile} socialLinks={socialLinks} onSocialLinksChange={setSocialLinks} avatarPreview={avatarPreview} onAvatarChange={(event) => { const file = event.target.files?.[0]; setAvatarPreview(file ? URL.createObjectURL(file) : ''); }} saving={saving} onSubmit={(event) => { event.preventDefault(); saveProfile(event.currentTarget); }} onCancel={resetProfileForm} />}
        {activeTab === 'appearance' && <AppearanceEditor settings={settings} saving={saving} backgroundPreview={backgroundPreview} onSubmit={(e) => { e.preventDefault(); saveSettings(e.currentTarget); }} onBackgroundChange={(event) => { const file = event.target.files?.[0]; setBackgroundPreview(file ? URL.createObjectURL(file) : ''); }} />}
        </aside></div>}
    </main>
  );
}

export default App;
