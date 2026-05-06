import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import ProfileEditor from '../editor/ProfileEditor'
import type { DiveProfile } from '../../types'

export default function EditorPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const { profiles, updateProfile, deleteProfile } = useStore()

  const profile = profiles.find(p => p.id === profileId)

  if (!profile) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Profil introuvable.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 underline">
          Retour à l'accueil
        </button>
      </div>
    )
  }

  function handleSave(updated: DiveProfile) {
    updateProfile(updated)
    navigate('/')
  }

  function handleDelete(id: string) {
    deleteProfile(id)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← Retour
        </button>
        <div className="bg-white rounded-xl shadow">
          <ProfileEditor
            profile={profile}
            onSave={handleSave}
            onCancel={() => navigate('/')}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}
