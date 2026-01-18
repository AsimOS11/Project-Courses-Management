/* ================================
   PROJECT MANAGEMENT HUB - APP.JS
   ================================
   
   FEATURES:
   - 2-Page App (Management Dashboard + Detail Pages)
   - Projects with timeline and file attachments
   - Courses tracking with progress
   - LocalStorage persistence
   - Dark theme optimized
   - File upload (Images, PDF, Word, PPT)
   
   HOW TO USE:
   1. Open index.html in your browser
   2. All data is stored in localStorage
   3. Use Export/Import to backup data
   4. Clear browser data to reset
   
   ================================ */

// Global Variables
const STORAGE_KEY = 'projectManagementHub';
let currentProjectId = null;
let pendingFiles = [];

// ================================
// DATA MANAGEMENT
// ================================

function initializeData() {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (!existingData) {
        const sampleData = {
            projects: [
                {
                    id: generateId('proj'),
                    name: 'Digital IC Design',
                    description: 'Complete VLSI design flow from RTL to GDSII including synthesis, place and route',
                    futureWork: 'Implement advanced verification techniques and timing optimization',
                    progress: 65,
                    updates: [
                        {
                            id: generateId('upd'),
                            text: 'Completed RTL design phase and verified all modules using testbenches',
                            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
                            timeSpent: '3 hours',
                            attachments: []
                        }
                    ],
                    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
                    updatedAt: new Date(Date.now() - 86400000).toISOString()
                }
            ],
            courses: [
                {
                    id: generateId('course'),
                    name: 'SystemVerilog for Verification',
                    platform: 'YouTube',
                    link: 'https://youtube.com',
                    totalVideos: 50,
                    completed: 20,
                    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ]
        };
        saveData(sampleData);
    }
}

function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { projects: [], courses: [] };
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ================================
// NAVIGATION
// ================================

function navigateTo(hash) {
    window.location.hash = hash;
}

function handleRouting() {
    const hash = window.location.hash || '#/';
    
    // Hide all views
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    
    if (hash === '#/' || hash === '') {
        document.getElementById('dashboard-view').classList.add('active');
        renderDashboard();
    } else if (hash === '#/projects') {
        document.getElementById('projects-view').classList.add('active');
        renderProjectsList();
    } else if (hash.startsWith('#/project/')) {
        const projectId = hash.split('/')[2];
        currentProjectId = projectId;
        document.getElementById('project-detail-view').classList.add('active');
        renderProjectDetail(projectId);
    } else if (hash === '#/courses') {
        document.getElementById('courses-view').classList.add('active');
        renderCoursesList();
    }
}

// ================================
// DASHBOARD RENDERING
// ================================

function renderDashboard() {
    const data = loadData();
    
    // Update counts
    document.getElementById('projects-count').textContent = data.projects.length;
    document.getElementById('courses-count').textContent = data.courses.length;
    
    // Render projects preview
    const projectsPreview = document.getElementById('projects-preview');
    if (data.projects.length === 0) {
        projectsPreview.innerHTML = '<p style="color: var(--text-secondary);">No projects yet. Add your first project!</p>';
    } else {
        projectsPreview.innerHTML = data.projects.slice(0, 6).map(p => `
            <div class="preview-item" onclick="navigateTo('#/project/${p.id}')">
                <div class="preview-item-name">${p.name}</div>
                <div class="preview-item-meta">${p.progress}% complete</div>
            </div>
        `).join('');
    }
    
    // Render courses preview
    const coursesPreview = document.getElementById('courses-preview');
    if (data.courses.length === 0) {
        coursesPreview.innerHTML = '<p style="color: var(--text-secondary);">No courses yet. Start your learning journey!</p>';
    } else {
        coursesPreview.innerHTML = data.courses.slice(0, 6).map(c => {
            const percent = Math.round((c.completed / c.totalVideos) * 100) || 0;
            return `
                <div class="preview-item" onclick="navigateTo('#/courses')">
                    <div class="preview-item-name">${c.name}</div>
                    <div class="preview-item-meta">${percent}% completed</div>
                </div>
            `;
        }).join('');
    }
}

// ================================
// PROJECTS RENDERING
// ================================

function renderProjectsList() {
    const data = loadData();
    const grid = document.getElementById('projects-grid');
    
    if (data.projects.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 3rem;">No projects yet. Click "Add Project" to create one!</p>';
        return;
    }
    
    grid.innerHTML = data.projects.map(project => `
        <div class="project-card" onclick="navigateTo('#/project/${project.id}')">
            <div class="project-card-header">
                <h3 class="project-card-title">${project.name}</h3>
            </div>
            <p class="project-card-description">${project.description}</p>
            <div class="project-card-footer">
                <div class="project-progress">
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
                        Progress: ${project.progress}%
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    ${project.updates.length} updates
                </div>
            </div>
        </div>
    `).join('');
}

function renderProjectDetail(projectId) {
    const data = loadData();
    const project = data.projects.find(p => p.id === projectId);
    
    if (!project) {
        navigateTo('#/projects');
        return;
    }
    
    // Render header
    const header = document.getElementById('project-detail-header');
    header.innerHTML = `
        <h2 class="project-detail-title">${project.name}</h2>
        <p style="color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 1.5rem;">${project.description}</p>
        
        <div class="project-meta-grid">
            <div class="meta-item">
                <div class="meta-label">Progress</div>
                <div class="meta-value">${project.progress}%</div>
                <div class="progress-bar" style="margin-top: 0.5rem;">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Total Updates</div>
                <div class="meta-value">${project.updates.length}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Created</div>
                <div class="meta-value">${formatDate(project.createdAt)}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Last Updated</div>
                <div class="meta-value">${formatDate(project.updatedAt)}</div>
            </div>
        </div>
        
        ${project.futureWork ? `
            <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-input); border-radius: var(--radius-md);">
                <strong style="color: var(--accent-primary);">🎯 Future Work:</strong>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">${project.futureWork}</p>
            </div>
        ` : ''}
    `;
    
    // Render timeline
    const timeline = document.getElementById('project-timeline');
    if (project.updates.length === 0) {
        timeline.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No updates yet. Click "Add Update" to track your progress!</p>';
        return;
    }
    
    timeline.innerHTML = project.updates
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map(update => `
            <div class="timeline-item">
                <div class="timeline-header">
                    <div class="timeline-meta">
                        <div class="timeline-date">
                            📅 ${formatDate(update.timestamp)} at ${formatTime(update.timestamp)}
                        </div>
                        ${update.timeSpent ? `
                            <span class="time-spent-badge">
                                ⏱️ ${update.timeSpent}
                            </span>
                        ` : ''}
                    </div>
                    <div class="timeline-actions">
                        <button class="btn btn-secondary btn-sm" onclick="editUpdate('${update.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUpdate('${update.id}')">Delete</button>
                    </div>
                </div>
                <div class="timeline-content">${update.text}</div>
                ${update.attachments && update.attachments.length > 0 ? `
                    <div class="attachments-section">
                        <span class="attachments-label">📎 Attachments (${update.attachments.length})</span>
                        <div class="attachments-grid">
                            ${update.attachments.map((att, idx) => `
                                <div class="attachment-item" onclick='viewAttachment(${JSON.stringify(att).replace(/'/g, "&#39;")})'>
                                    <div class="attachment-icon">${getFileIcon(att.type, att.name)}</div>
                                    <div class="attachment-name">${att.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `).join('');
}

// ================================
// PROJECT MODAL
// ================================

function openProjectModal(projectId = null) {
    const modal = document.getElementById('project-modal');
    const title = document.getElementById('project-modal-title');
    const form = document.getElementById('project-form');
    
    form.reset();
    
    if (projectId) {
        const data = loadData();
        const project = data.projects.find(p => p.id === projectId);
        if (project) {
            title.textContent = 'Edit Project';
            document.getElementById('edit-project-id').value = project.id;
            document.getElementById('project-name').value = project.name;
            document.getElementById('project-description').value = project.description;
            document.getElementById('project-future').value = project.futureWork || '';
            document.getElementById('project-progress').value = project.progress;
            document.getElementById('progress-display').textContent = project.progress;
        }
    } else {
        title.textContent = 'Add New Project';
        document.getElementById('edit-project-id').value = '';
        document.getElementById('progress-display').textContent = '0';
    }
    
    modal.classList.add('active');
}

function closeProjectModal() {
    document.getElementById('project-modal').classList.remove('active');
}

// ================================
// UPDATE MODAL
// ================================

function openUpdateModal(updateId = null) {
    const modal = document.getElementById('update-modal');
    const title = document.getElementById('update-modal-title');
    const form = document.getElementById('update-form');
    
    form.reset();
    pendingFiles = [];
    document.getElementById('files-preview').innerHTML = '';
    
    if (updateId) {
        const data = loadData();
        const project = data.projects.find(p => p.id === currentProjectId);
        const update = project.updates.find(u => u.id === updateId);
        if (update) {
            title.textContent = 'Edit Update';
            document.getElementById('edit-update-id').value = update.id;
            document.getElementById('update-text').value = update.text;
            document.getElementById('update-timestamp').value = new Date(update.timestamp).toISOString().slice(0, 16);
            document.getElementById('update-time-spent').value = update.timeSpent || '';
            
            // Show existing attachments
            if (update.attachments && update.attachments.length > 0) {
                displayExistingAttachments(update.attachments);
            }
        }
    } else {
        title.textContent = 'Add Update';
        document.getElementById('edit-update-id').value = '';
        document.getElementById('update-timestamp').value = new Date().toISOString().slice(0, 16);
    }
    
    modal.classList.add('active');
}

function closeUpdateModal() {
    document.getElementById('update-modal').classList.remove('active');
    pendingFiles = [];
}

// ================================
// COURSES RENDERING
// ================================

function renderCoursesList() {
    const data = loadData();
    const tbody = document.getElementById('courses-table-body');
    const badge = document.getElementById('total-courses-badge');
    
    badge.textContent = data.courses.length;
    
    if (data.courses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No courses yet. Add your first course above!</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.courses.slice(0, 10).map((course, index) => {
        const percentDone = course.totalVideos > 0 ? Math.round((course.completed / course.totalVideos) * 100) : 0;
        const percentLeft = 100 - percentDone;
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${course.name}</strong></td>
                <td>${course.platform}</td>
                <td>${course.link ? `<a href="${course.link}" target="_blank" class="course-link">🔗 View</a>` : '-'}</td>
                <td>${course.totalVideos}</td>
                <td>${course.completed}</td>
                <td class="progress-cell">
                    <div>${percentDone}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentDone}%"></div>
                    </div>
                </td>
                <td>${percentLeft}%</td>
                <td>
                    <input type="number" class="update-input" min="0" max="${course.totalVideos}" 
                           value="${course.completed}" onchange="updateCourseProgress('${course.id}', this.value)">
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteCourse('${course.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ================================
// FILE HANDLING
// ================================

function getFileIcon(type, name) {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf' || name.endsWith('.pdf')) return '📄';
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
    if (type.includes('presentation') || name.endsWith('.ppt') || name.endsWith('.pptx')) return '📊';
    return '📎';
}

function handleFileSelect(files) {
    pendingFiles = [...pendingFiles, ...Array.from(files)];
    displayPendingFiles();
}

function displayPendingFiles() {
    const preview = document.getElementById('files-preview');
    preview.innerHTML = pendingFiles.map((file, index) => `
        <div class="attachment-item">
            <div class="attachment-icon">${getFileIcon(file.type, file.name)}</div>
            <div class="attachment-name">${file.name}</div>
            <button class="attachment-remove" onclick="removePendingFile(${index})">×</button>
        </div>
    `).join('');
}

function displayExistingAttachments(attachments) {
    const preview = document.getElementById('files-preview');
    preview.innerHTML = attachments.map((att, index) => `
        <div class="attachment-item">
            <div class="attachment-icon">${getFileIcon(att.type, att.name)}</div>
            <div class="attachment-name">${att.name}</div>
            <button class="attachment-remove" onclick="removeExistingAttachment(${index})">×</button>
        </div>
    `).join('');
}

function removePendingFile(index) {
    pendingFiles.splice(index, 1);
    displayPendingFiles();
}

function removeExistingAttachment(index) {
    const data = loadData();
    const project = data.projects.find(p => p.id === currentProjectId);
    const updateId = document.getElementById('edit-update-id').value;
    const update = project.updates.find(u => u.id === updateId);
    
    if (update && update.attachments) {
        update.attachments.splice(index, 1);
        saveData(data);
        displayExistingAttachments(update.attachments);
    }
}

async function filesToBase64(files) {
    const results = [];
    for (const file of files) {
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        results.push({
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64
        });
    }
    return results;
}

function viewAttachment(attachment) {
    const modal = document.getElementById('attachment-modal');
    const title = document.getElementById('attachment-title');
    const content = document.getElementById('attachment-content');
    
    title.textContent = attachment.name;
    
    if (attachment.type.startsWith('image/')) {
        content.innerHTML = `<img src="${attachment.data}" alt="${attachment.name}" style="max-width: 100%; border-radius: var(--radius-md);">`;
    } else if (attachment.type === 'application/pdf') {
        content.innerHTML = `
            <iframe src="${attachment.data}" style="width: 100%; height: 70vh; border: none; border-radius: var(--radius-md);"></iframe>
            <div style="margin-top: 1rem; text-align: center;">
                <a href="${attachment.data}" download="${attachment.name}" class="btn btn-primary">Download PDF</a>
            </div>
        `;
    } else {
        const size = (attachment.size / 1024).toFixed(1);
        content.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">${getFileIcon(attachment.type, attachment.name)}</div>
                <p style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.1rem;">${attachment.name}</p>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Size: ${size} KB</p>
                <a href="${attachment.data}" download="${attachment.name}" class="btn btn-primary">Download File</a>
            </div>
        `;
    }
    
    modal.classList.add('active');
}

function closeAttachmentModal() {
    document.getElementById('attachment-modal').classList.remove('active');
}

// ================================
// FORM SUBMISSIONS
// ================================

document.getElementById('project-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const data = loadData();
    const editId = document.getElementById('edit-project-id').value;
    const now = new Date().toISOString();
    
    const projectData = {
        name: document.getElementById('project-name').value,
        description: document.getElementById('project-description').value,
        futureWork: document.getElementById('project-future').value,
        progress: parseInt(document.getElementById('project-progress').value),
        updatedAt: now
    };
    
    if (editId) {
        const index = data.projects.findIndex(p => p.id === editId);
        if (index !== -1) {
            data.projects[index] = { ...data.projects[index], ...projectData };
        }
    } else {
        const newProject = {
            id: generateId('proj'),
            ...projectData,
            updates: [],
            createdAt: now
        };
        data.projects.push(newProject);
    }
    
    saveData(data);
    closeProjectModal();
    
    if (window.location.hash.startsWith('#/project/')) {
        renderProjectDetail(currentProjectId);
    } else {
        renderProjectsList();
    }
});

document.getElementById('update-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const data = loadData();
    const project = data.projects.find(p => p.id === currentProjectId);
    const editId = document.getElementById('edit-update-id').value;
    
    // Convert files to base64
    const attachments = await filesToBase64(pendingFiles);
    
    const updateData = {
        text: document.getElementById('update-text').value,
        timestamp: new Date(document.getElementById('update-timestamp').value).toISOString(),
        timeSpent: document.getElementById('update-time-spent').value,
        attachments: attachments
    };
    
    if (editId) {
        const index = project.updates.findIndex(u => u.id === editId);
        if (index !== -1) {
            const existingAttachments = project.updates[index].attachments || [];
            updateData.attachments = [...existingAttachments, ...attachments];
            project.updates[index] = { ...project.updates[index], ...updateData };
        }
    } else {
        const newUpdate = {
            id: generateId('upd'),
            ...updateData
        };
        project.updates.push(newUpdate);
    }
    
    project.updatedAt = new Date().toISOString();
    saveData(data);
    closeUpdateModal();
    renderProjectDetail(currentProjectId);
});

document.getElementById('course-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const data = loadData();
    const now = new Date().toISOString();
    
    const newCourse = {
        id: generateId('course'),
        name: document.getElementById('course-name').value,
        platform: document.getElementById('course-platform').value,
        link: document.getElementById('course-link').value,
        totalVideos: parseInt(document.getElementById('course-total').value),
        completed: 0,
        createdAt: now,
        updatedAt: now
    };
    
    data.courses.push(newCourse);
    saveData(data);
    
    this.reset();
    renderCoursesList();
});

// ================================
// CRUD OPERATIONS
// ================================

function editUpdate(updateId) {
    openUpdateModal(updateId);
}

function deleteUpdate(updateId) {
    if (!confirm('Are you sure you want to delete this update?')) return;
    
    const data = loadData();
    const project = data.projects.find(p => p.id === currentProjectId);
    project.updates = project.updates.filter(u => u.id !== updateId);
    project.updatedAt = new Date().toISOString();
    saveData(data);
    renderProjectDetail(currentProjectId);
}

function updateCourseProgress(courseId, completed) {
    const data = loadData();
    const course = data.courses.find(c => c.id === courseId);
    if (course) {
        course.completed = Math.min(parseInt(completed) || 0, course.totalVideos);
        course.updatedAt = new Date().toISOString();
        saveData(data);
        renderCoursesList();
    }
}

function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    const data = loadData();
    data.courses = data.courses.filter(c => c.id !== courseId);
    saveData(data);
    renderCoursesList();
}

// ================================
// IMPORT / EXPORT
// ================================

function exportData() {
    const data = loadData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-management-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

document.getElementById('import-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!confirm('Importing will replace all current data. Continue?')) {
        e.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            if (importedData.projects && importedData.courses) {
                saveData(importedData);
                alert('Data imported successfully!');
                handleRouting();
            } else {
                alert('Invalid data format');
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
        e.target.value = '';
    };
    reader.readAsText(file);
});

// ================================
// UTILITIES
// ================================

function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString();
}

function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ================================
// EVENT LISTENERS
// ================================

// Progress slider
document.getElementById('project-progress').addEventListener('input', function(e) {
    document.getElementById('progress-display').textContent = e.target.value;
});

// File upload zone
const uploadZone = document.getElementById('file-upload-zone');
const fileInput = document.getElementById('update-files');

uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files);
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    handleFileSelect(e.dataTransfer.files);
});

// Modal overlay clicks
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function() {
        this.parentElement.classList.remove('active');
    });
});

// ================================
// INITIALIZATION
// ================================

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', () => {
    initializeData();
    handleRouting();
});

console.log('🎯 Project Management Hub initialized!');
console.log('📦 Data stored in localStorage key:', STORAGE_KEY);
console.log('💾 Use Export/Import buttons to backup your data');
