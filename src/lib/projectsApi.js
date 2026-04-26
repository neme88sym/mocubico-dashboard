import { supabase } from './supabase'

// Gestisce sia text (legacy pre-migrazione) che text[] (nuovo schema)
function normalizeSoftware(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value) return [value]
  return []
}

function toProject(row) {
  return {
    id:        row.id,
    title:     row.title,
    client:    row.client,
    software:  normalizeSoftware(row.software),
    status:    row.status,
    tags:      row.tags ?? [],
    thumbnail: row.thumbnail ?? null,
    videoUrl:  row.video_url ?? null,
    duration:  row.duration ?? null,
    updatedAt: row.updated_at ? row.updated_at.slice(0, 10) : null,
    createdAt: row.created_at ?? null,
  }
}

function toRow(project) {
  return {
    title:     project.title,
    client:    project.client,
    software:  normalizeSoftware(project.software),
    status:    project.status,
    tags:      project.tags ?? [],
    thumbnail: project.thumbnail ?? null,
    video_url: project.videoUrl ?? null,
    duration:  project.duration ?? null,
  }
}

export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data.map(toProject)
}

export async function createProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert(toRow(project))
    .select()
    .single()
  if (error) throw error
  return toProject(data)
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function fetchProjectById(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return toProject(data)
}

export async function updateStatus(id, status) {
  const { data, error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return toProject(data)
}
