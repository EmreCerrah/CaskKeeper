import { useState } from "react";
import { Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AromaTagPicker } from "./AromaTagPicker";
import { RatingInput } from "./RatingInput";
import { Button } from "../Button";
import { useAromaWheel } from "../../data/aromaWheel";
import type { NoteFormState } from "../../data/note-payload";
import type { FinishLength } from "../../data/tastingNotes";
import { t, type TranslationKey } from "../../i18n";
import { theme } from "../../theme";

interface TastingNoteFormProps {
  initial: NoteFormState;
  submitLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (form: NoteFormState) => void;
}

/**
 * Finish lengths and their dictionary keys.
 *
 * The keys are not built from a template (`\`noteForm.finish.${length}\``):
 * a template does not satisfy TranslationKey, so it would need `as never` —
 * and that would disable the very guard that turns a missing key into a
 * compile error. Written out explicitly, the type system checks all three.
 */
const FINISH_LENGTHS: { value: FinishLength; labelKey: TranslationKey }[] = [
  { value: "short", labelKey: "noteForm.finish.short" },
  { value: "medium", labelKey: "noteForm.finish.medium" },
  { value: "long", labelKey: "noteForm.finish.long" },
];

/**
 * The tasting note form — the shared body of the new-note and edit screens.
 *
 * One scroll, not a multi-step wizard: the same sections as the web (session,
 * nose, palate, finish, personal) stacked. Splitting them into steps would
 * bring state management and back-button behaviour, and give nothing back.
 */
export function TastingNoteForm({ initial, submitLabel, busy, error, onSubmit }: TastingNoteFormProps) {
  const [form, setForm] = useState<NoteFormState>(initial);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const aromaWheel = useAromaWheel();

  function update<K extends keyof NoteFormState>(key: K, value: NoteFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const categories = aromaWheel.data ?? [];

  return (
    <View style={styles.wrapper}>
      <Section title={t("noteForm.session")}>
        <Row label={t("noteForm.date")}>
          <Pressable onPress={() => setDatePickerOpen(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>{form.tastingDate.toLocaleDateString()}</Text>
          </Pressable>
        </Row>

        {datePickerOpen && (
          <DateTimePicker
            value={form.tastingDate}
            mode="date"
            maximumDate={new Date()}
            onChange={(_event, date) => {
              // On Android the picker closes on every interaction; on iOS it
              // stays open.
              if (Platform.OS !== "ios") setDatePickerOpen(false);
              if (date) update("tastingDate", date);
            }}
          />
        )}

        <Text style={styles.label}>{t("noteForm.rating")}</Text>
        <RatingInput value={form.rating} onChange={(value) => update("rating", value)} />
      </Section>

      <Section title={t("noteForm.nose")}>
        <AromaTagPicker
          categories={categories}
          selected={form.noseTags}
          onChange={(tags) => update("noseTags", tags)}
        />
        <NotesInput
          value={form.noseNotes}
          onChangeText={(value) => update("noseNotes", value)}
          placeholder={t("noteForm.nosePlaceholder")}
        />
      </Section>

      <Section title={t("noteForm.palate")}>
        <AromaTagPicker
          categories={categories}
          selected={form.palateTags}
          onChange={(tags) => update("palateTags", tags)}
        />
        <NotesInput
          value={form.palateNotes}
          onChangeText={(value) => update("palateNotes", value)}
          placeholder={t("noteForm.palatePlaceholder")}
        />
      </Section>

      <Section title={t("noteForm.finish")}>
        <Text style={styles.label}>{t("noteForm.finishLength")}</Text>
        <View style={styles.choices}>
          {FINISH_LENGTHS.map(({ value, labelKey }) => {
            const active = form.finishLength === value;
            return (
              <Pressable
                key={value}
                onPress={() => update("finishLength", value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.choice, active && styles.choiceActive]}
              >
                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{t(labelKey)}</Text>
              </Pressable>
            );
          })}
        </View>

        <AromaTagPicker
          categories={categories}
          selected={form.finishTags}
          onChange={(tags) => update("finishTags", tags)}
        />
        <NotesInput
          value={form.finishNotes}
          onChangeText={(value) => update("finishNotes", value)}
          placeholder={t("noteForm.finishPlaceholder")}
        />
      </Section>

      <Section title={t("noteForm.personal")}>
        <NotesInput
          value={form.personalNotes}
          onChangeText={(value) => update("personalNotes", value)}
          placeholder={t("noteForm.personalPlaceholder")}
        />

        <Row label={t("noteForm.public")}>
          <Switch
            value={form.visibility === "public"}
            onValueChange={(on) => update("visibility", on ? "public" : "private")}
            trackColor={{ true: theme.primary, false: theme.border }}
          />
        </Row>

        <Row label={t("noteForm.favorite")}>
          <Switch
            value={form.isFavorite}
            onValueChange={(on) => update("isFavorite", on)}
            trackColor={{ true: theme.primary, false: theme.border }}
          />
        </Row>
      </Section>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button label={submitLabel} onPress={() => onSubmit(form)} busy={busy} />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function NotesInput({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.textMuted}
      style={styles.textarea}
      multiline
      textAlignVertical="top"
    />
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 20 },
  section: { gap: 8 },
  sectionTitle: { color: theme.text, fontSize: 17, fontWeight: "700" },
  sectionBody: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 44 },
  label: { color: theme.textMuted, fontSize: 14 },
  dateButton: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  dateText: { color: theme.text, fontSize: 15 },
  choices: { flexDirection: "row", gap: 8 },
  choice: {
    alignItems: "center",
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  choiceActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  choiceText: { color: theme.text, fontSize: 14 },
  choiceTextActive: { color: theme.onPrimary, fontWeight: "700" },
  textarea: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.text,
    fontSize: 15,
    minHeight: 88,
    padding: 12,
  },
  error: { color: theme.danger, fontSize: 14 },
});
