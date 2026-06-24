import { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native'
import { supabase } from '../api/supabase'

const MOOD_TAGS = [
  { label: 'Happy', color: '#E8F8F6', textColor: '#0F6E56' },
  { label: 'Calm', color: '#EDE9FF', textColor: '#3C3489' },
  { label: 'Anxious', color: '#FFF3E8', textColor: '#854F0B' },
  { label: 'Sad', color: '#E6F1FB', textColor: '#0C447C' },
  { label: 'Angry', color: '#FCEBEB', textColor: '#791F1F' },
  { label: 'Mixed', color: '#F5F5F5', textColor: '#6B7280' },
  { label: 'Hopeful', color: '#E8F8F6', textColor: '#085041' },
  { label: 'Tired', color: '#F0F0F0', textColor: '#9BA3B0' },
]

type JournalEntry = {
  id: string
  content: string
  mood_tag: string | null
  created_at: string
}

export default function JournalScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [ageRange, setAgeRange] = useState('18plus')
  const [error, setError] = useState<string | null>(null)
  const [showWriter, setShowWriter] = useState(false)
  const [content, setContent] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [contentFocused, setContentFocused] = useState(false)
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const userAgeRange = user?.user_metadata?.age_range || '18plus'
      setAgeRange(userAgeRange)
      if (user) {
        const { data } = await supabase
          .from('journal_entries')
          .select('id, content, mood_tag, created_at')
          .eq('student_id', user.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
        if (data) setEntries(data)
      }
    } catch (e) {
      console.log('Fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
        .from('journal_entries')
        .insert({
          student_id: user.id,
          content: content.trim(),
          mood_tag: selectedTag,
        })
      if (!error) {
          setContent('')
          setSelectedTag(null)
          setShowWriter(false)
          fetchEntries()
        }
      }
    } catch (e) {
      console.log('Save error:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (entry: JournalEntry) => {
    Alert.alert(
      'Delete entry',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase
              .from('journal_entries')
              .update({ is_deleted: true })
              .eq('id', entry.id)
            setViewingEntry(null)
            fetchEntries()
          },
        },
      ]
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getMoodTag = (tag: string | null) => {
    if (!tag) return null
    return MOOD_TAGS.find(t => t.label === tag)
  }

  // View single entry
  if (viewingEntry) {
    const tag = getMoodTag(viewingEntry.mood_tag)
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setViewingEntry(null)}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal entry</Text>
          <TouchableOpacity
            onPress={() => handleDelete(viewingEntry)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.viewContent}>
          <Text style={styles.entryDate}>{formatDate(viewingEntry.created_at)}</Text>
          {tag && (
            <View style={[styles.tagBadge, { backgroundColor: tag.color }]}>
              <Text style={[styles.tagBadgeText, { color: tag.textColor }]}>
                {viewingEntry.mood_tag}
              </Text>
            </View>
          )}
          <Text style={styles.entryFullText}>{viewingEntry.content}</Text>
          <View style={styles.privacyNoteBottom}>
            <Text style={styles.privacyNoteText}>
              This entry is private to you and will never be shared.
            </Text>
          </View>
        </ScrollView>
      </View>
    )
  }

  // Write new entry
  if (showWriter) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setShowWriter(false)
              setContent('')
              setSelectedTag(null)
            }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New entry</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!content.trim() || saving}
          >
            <Text style={[
              styles.saveText,
              (!content.trim() || saving) && styles.saveTextDisabled,
            ]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.writerContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.privacyBadge}>
            <Text style={styles.privacyBadgeText}>
              Private to you — never shared
            </Text>
          </View>

          <Text style={styles.writerDate}>{formatDate(new Date().toISOString())}</Text>

          <TextInput
            style={[
              styles.writerInput,
              contentFocused && styles.writerInputFocused,
            ]}
            placeholder="Write anything — this is just for you..."
            placeholderTextColor="#C0C8D0"
            value={content}
            onChangeText={setContent}
            onFocus={() => setContentFocused(true)}
            onBlur={() => setContentFocused(false)}
            multiline
            autoFocus
            textAlignVertical="top"
          />

          <Text style={styles.tagLabel}>How are you feeling? (optional)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsScroll}
          >
            {MOOD_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag.label}
                style={[
                  styles.tagChip,
                  { backgroundColor: tag.color },
                  selectedTag === tag.label && styles.tagChipSelected,
                ]}
                onPress={() => setSelectedTag(
                  selectedTag === tag.label ? null : tag.label
                )}
              >
                <Text style={[styles.tagChipText, { color: tag.textColor }]}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.charCount}>{content.length} characters</Text>
        </ScrollView>
      </View>
    )
  }

  // Entry list
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journal Vault</Text>
        <TouchableOpacity
          onPress={() => setShowWriter(true)}
          style={styles.newButton}
        >
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.listContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.privacyBanner}>
        <Text style={styles.privacyBannerText}>
          {ageRange === '18plus'
           ? 'Your journal is completely private. No one else can ever read your entries.'
           : 'Your journal is private to you. Parents never see your entries.'}
        </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {loading ? (
            <Text style={styles.loadingText}>Loading your entries...</Text>
          ) : entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📔</Text>
              <Text style={styles.emptyTitle}>Your journal is empty</Text>
              <Text style={styles.emptySubtitle}>
                Write something — just for you. No one else will ever read it.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setShowWriter(true)}
              >
                <Text style={styles.buttonText}>Write your first entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.entryCount}>
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </Text>
              {entries.map((entry) => {
                const tag = getMoodTag(entry.mood_tag)
                return (
                  <TouchableOpacity
                    key={entry.id}
                    style={styles.entryCard}
                    onPress={() => setViewingEntry(entry)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.entryCardTop}>
                      <Text style={styles.entryCardDate}>
                        {formatDate(entry.created_at)}
                      </Text>
                      {tag && (
                        <View style={[
                          styles.tagBadge,
                          { backgroundColor: tag.color },
                        ]}>
                          <Text style={[
                            styles.tagBadgeText,
                            { color: tag.textColor },
                          ]}>
                            {entry.mood_tag}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.entryPreview} numberOfLines={2}>
                      {entry.content}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 14,
    color: '#4DB6AC',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E3A59',
  },
  newButton: {
    width: 60,
    alignItems: 'flex-end',
  },
  newButtonText: {
    fontSize: 14,
    color: '#4DB6AC',
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 14,
    color: '#E05555',
    fontWeight: '500',
    width: 60,
    textAlign: 'right',
  },
  saveText: {
    fontSize: 14,
    color: '#4DB6AC',
    fontWeight: '600',
    width: 60,
    textAlign: 'right',
  },
  saveTextDisabled: {
    opacity: 0.4,
  },
  listContainer: {
    flex: 1,
  },
  privacyBanner: {
    backgroundColor: '#F0FAFA',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F6',
  },
  privacyBannerText: {
    fontSize: 12,
    color: '#4DB6AC',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContent: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#9BA3B0',
    textAlign: 'center',
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  entryCount: {
    fontSize: 12,
    color: '#9BA3B0',
    marginBottom: 14,
    fontWeight: '500',
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  entryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryCardDate: {
    fontSize: 12,
    color: '#9BA3B0',
    fontWeight: '500',
  },
  entryPreview: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 20,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  viewContent: {
    padding: 24,
    paddingBottom: 40,
  },
  entryDate: {
    fontSize: 13,
    color: '#9BA3B0',
    marginBottom: 12,
    fontWeight: '500',
  },
  entryFullText: {
    fontSize: 16,
    color: '#2E3A59',
    lineHeight: 26,
    marginTop: 16,
  },
  privacyNoteBottom: {
    backgroundColor: '#F0FAFA',
    borderRadius: 12,
    padding: 12,
    marginTop: 32,
  },
  privacyNoteText: {
    fontSize: 12,
    color: '#4DB6AC',
    textAlign: 'center',
    lineHeight: 18,
  },
  writerContent: {
    padding: 24,
    paddingBottom: 40,
  },
  privacyBadge: {
    backgroundColor: '#EDE9FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginBottom: 16,
  },
  privacyBadgeText: {
    fontSize: 11,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  writerDate: {
    fontSize: 13,
    color: '#9BA3B0',
    marginBottom: 16,
    fontWeight: '500',
  },
  writerInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2E3A59',
    minHeight: 200,
    lineHeight: 24,
  },
  writerInputFocused: {
    borderColor: '#4DB6AC',
  },
  tagLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2E3A59',
    marginTop: 20,
    marginBottom: 12,
  },
  tagsScroll: {
    marginBottom: 16,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tagChipSelected: {
    borderColor: '#4DB6AC',
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  charCount: {
    fontSize: 11,
    color: '#C0C8D0',
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
})