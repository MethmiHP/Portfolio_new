import { useState } from 'react';
import { api, mediaUrl } from '../../src/api';

export default function ProjectForm({ project, categories = [], onSave, onCancel }) {
  const [form, setForm] = useState({
    title: project?.title || '',
    subtitle: project?.subtitle || '',
    description: project?.description || '',
    category: project?.category || 'Development',
    link: project?.link || '',
    order: project?.order || 0,
    technologies: (project?.technologies || []).join(', '),
  });
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'technologies') {
        fd.append(
          'technologies',
          JSON.stringify(val.split(',').map((t) => t.trim()).filter(Boolean)),
        );
      } else {
        fd.append(key, val);
      }
    });
    if (image) fd.append('image', image);
    if (video) fd.append('video', video);
    if (removeImage) fd.append('removeImage', 'true');
    if (removeVideo) fd.append('removeVideo', 'true');

    try {
      if (project?._id) {
        await api.updateProject(project._id, fd);
      } else {
        await api.createProject(fd);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-form project-form" onSubmit={handleSubmit}>
      <h3>{project?._id ? 'Edit Project' : 'Add Project'}</h3>
      {error && <p className="admin-error">{error}</p>}

      <label>
        Title
        <input name="title" value={form.title} onChange={handleChange} required />
      </label>
      <label>
        Subtitle
        <input name="subtitle" value={form.subtitle} onChange={handleChange} />
      </label>
      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
      </label>
      <label>
        Category
        <input
          name="category"
          list="project-category-options"
          value={form.category}
          onChange={handleChange}
          placeholder="Development, Video Editing, Blender 3D, Mobile App, T-Shirt Design"
        />
        <datalist id="project-category-options">
          {['Development', 'Video Editing', 'Blender 3D', 'Mobile App', 'T-Shirt Design', ...categories].map((category) => (
            <option value={category} key={category} />
          ))}
        </datalist>
      </label>
      <label>
        Technologies (comma separated)
        <input name="technologies" value={form.technologies} onChange={handleChange} />
      </label>
      <label>
        Project Link
        <input name="link" value={form.link} onChange={handleChange} />
      </label>
      <label>
        Order
        <input name="order" type="number" value={form.order} onChange={handleChange} />
      </label>
      <label>
        Image
        {project?.image && !image && !removeImage && (
          <div className="media-preview-row">
            <img src={mediaUrl(project.image)} alt="" className="preview-thumb" />
            <button type="button" className="btn-danger" onClick={() => setRemoveImage(true)}>
              Delete Image
            </button>
          </div>
        )}
        {removeImage && <span className="admin-muted-note">Current image will be deleted when you save.</span>}
        <input type="file" accept="image/*" onChange={(e) => {
          setImage(e.target.files[0]);
          setRemoveImage(false);
        }} />
      </label>
      <label>
        Video
        {project?.video && !video && !removeVideo && (
          <div className="media-preview-row">
            <video src={mediaUrl(project.video)} className="preview-thumb" muted />
            <button type="button" className="btn-danger" onClick={() => setRemoveVideo(true)}>
              Delete Video
            </button>
          </div>
        )}
        {removeVideo && <span className="admin-muted-note">Current video will be deleted when you save.</span>}
        <input type="file" accept="video/*" onChange={(e) => {
          setVideo(e.target.files[0]);
          setRemoveVideo(false);
        }} />
      </label>

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Project'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
