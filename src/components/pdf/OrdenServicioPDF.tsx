import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DeceasedRecord } from "../../types";
import { SERVICE_LABELS, RELIGIOUS_LABELS } from "../../utils/mockData";

/* ── palette ──────────────────────────────────────────── */
const GOLD = "#B8920A";
const GOLD_LIGHT = "#F9F3E3";
const DARK = "#0A1628";
const SLATE = "#475569";
const SLATE_LIGHT = "#94A3B8";
const BORDER = "#E2E8F0";
const WHITE = "#FFFFFF";
const BG = "#F8FAFC";

/* ── styles ───────────────────────────────────────────── */
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: DARK,
    backgroundColor: WHITE,
    paddingBottom: 50,
  },

  /* ── header ── */
  header: {
    backgroundColor: DARK,
    paddingHorizontal: 40,
    paddingTop: 26,
    paddingBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logoName: { fontSize: 20, color: WHITE },
  logoSub: { fontSize: 6.5, color: GOLD, letterSpacing: 2.5, marginTop: 3 },
  sucursalText: { fontSize: 7.5, color: SLATE_LIGHT, marginTop: 8 },
  ordenLabel: { fontSize: 6.5, color: SLATE_LIGHT, letterSpacing: 2 },
  ordenNum: { fontSize: 17, color: GOLD, marginTop: 2 },
  ordenDate: {
    fontSize: 7.5,
    color: SLATE_LIGHT,
    marginTop: 3,
    textAlign: "right",
  },

  goldBar: { height: 3, backgroundColor: GOLD },

  /* ── body ── */
  body: { paddingHorizontal: 40 },

  /* ── hero ── */
  hero: {
    backgroundColor: GOLD_LIGHT,
    borderRadius: 5,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeft: `3px solid ${GOLD}`,
  },
  heroName: { fontSize: 14, color: DARK },
  heroRut: { fontSize: 8, color: SLATE, marginTop: 2 },
  heroBadge: {
    backgroundColor: DARK,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  heroBadgeText: { fontSize: 7, color: GOLD, letterSpacing: 0.8 },

  /* ── section ── */
  section: { marginBottom: 13 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottom: `1px solid ${BORDER}`,
    paddingBottom: 5,
    marginBottom: 8,
  },
  sectionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: GOLD,
    marginRight: 7,
  },
  sectionTitle: { fontSize: 7.5, color: DARK, letterSpacing: 1 },

  /* ── grid ── */
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "50%", paddingRight: 10, paddingBottom: 8 },
  cellFull: { width: "100%", paddingBottom: 8 },
  label: {
    fontSize: 6.5,
    color: SLATE_LIGHT,
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  value: { fontSize: 8.5, color: DARK },
  valueMuted: { fontSize: 8.5, color: SLATE_LIGHT },

  /* ── items list ── */
  itemsBox: {
    backgroundColor: BG,
    borderRadius: 4,
    padding: 10,
    border: `1px solid ${BORDER}`,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
    borderBottom: `1px solid ${BORDER}`,
  },
  itemRowLast: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  itemDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: GOLD,
    marginTop: 2.5,
    marginRight: 8,
    flexShrink: 0,
  },
  itemText: { fontSize: 8.5, color: DARK, flex: 1 },

  /* ── location cards ── */
  locRow: { flexDirection: "row", gap: 8 },
  locCard: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: 4,
    padding: 10,
    border: `1px solid ${BORDER}`,
  },
  locTitle: { fontSize: 6.5, color: GOLD, letterSpacing: 0.8, marginBottom: 5 },
  locName: { fontSize: 8.5, color: DARK },
  locAddr: { fontSize: 7.5, color: SLATE, marginTop: 2 },

  /* ── team chips ── */
  teamRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 2 },
  teamChip: {
    backgroundColor: BG,
    border: `1px solid ${BORDER}`,
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  teamChipText: { fontSize: 7.5, color: DARK },
  teamCol: { width: "50%", paddingRight: 10 },
  teamLabel: {
    fontSize: 6.5,
    color: SLATE_LIGHT,
    letterSpacing: 0.7,
    marginBottom: 5,
  },

  /* ── obs box ── */
  obsBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: 4,
    padding: 9,
    border: `1px solid #FDE68A`,
    marginBottom: 7,
  },
  obsLabel: {
    fontSize: 6.5,
    color: SLATE_LIGHT,
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  obsText: { fontSize: 8, color: "#92400E", lineHeight: 1.5 },

  /* ── signatures ── */
  sigRow: { flexDirection: "row", gap: 20, marginTop: 22 },
  sigCol: { flex: 1, alignItems: "center" },
  sigLine: {
    height: 1,
    width: "100%",
    backgroundColor: BORDER,
    marginBottom: 5,
  },
  sigTitle: { fontSize: 7.5, color: SLATE },
  sigName: { fontSize: 7, color: SLATE_LIGHT, marginTop: 2 },

  /* ── footer ── */
  footer: { position: "absolute", bottom: 0, left: 0, right: 0 },
  footerBar: { height: 2, backgroundColor: GOLD },
  footerContent: {
    backgroundColor: DARK,
    paddingVertical: 9,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 6.5, color: SLATE_LIGHT },
  footerBrand: { fontSize: 6.5, color: GOLD, letterSpacing: 1 },
});

/* ── helpers ──────────────────────────────────────────── */
const v = (x?: string | number | null) =>
  x !== undefined && x !== null && x !== "" ? String(x) : null;

const fmtDate = (d?: string) => {
  if (!d) return null;
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  return `${parseInt(day)} de ${months[parseInt(m) - 1]} de ${y}`;
};

function Cell({
  label,
  value,
  full,
}: {
  label: string;
  value?: string | number | null;
  full?: boolean;
}) {
  const val = v(value);
  return (
    <View style={full ? s.cellFull : s.cell}>
      <Text style={s.label}>{label.toUpperCase()}</Text>
      {val ? (
        <Text style={s.value}>{val}</Text>
      ) : (
        <Text style={s.valueMuted}>—</Text>
      )}
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <View style={s.sectionRow}>
        <View style={s.sectionDot} />
        <Text style={s.sectionTitle}>{title.toUpperCase()}</Text>
      </View>
      {children}
    </View>
  );
}

/* ══════════════════════════════════════════════════════
   DOCUMENT
══════════════════════════════════════════════════════ */
export default function OrdenServicioPDF({
  record,
  teamStaff = [],
  teamVehicles = [],
}: {
  record: DeceasedRecord;
  teamStaff?: string[]; // nombres resueltos del personal técnico
  teamVehicles?: string[]; // etiquetas resueltas de los vehículos
}) {
  const serviceItems = (record.serviceIncludes ?? "")
    .split("\n")
    .filter(Boolean);

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(
    now.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${now.getFullYear()}`;
  const shortId = record.id.slice(-6).toUpperCase();

  const serviceLabel =
    (SERVICE_LABELS as Record<string, string>)[record.serviceType] ??
    record.serviceType;
  const religiousLabel =
    (RELIGIOUS_LABELS as Record<string, string>)[record.religiousPreference] ??
    record.religiousPreference;

  return (
    <Document
      title={`Orden de Servicio — ${record.fullName}`}
      author="Veladesk"
    >
      <Page size="A4" style={s.page}>
        {/* HEADER */}
        <View style={s.header}>
          <View>
            <Text style={s.logoName}>Veladesk</Text>
            <Text style={s.logoSub}>EL CETRO DE CONTROL</Text>
            {record.sucursal ? (
              <Text style={s.sucursalText}>Sucursal: {record.sucursal}</Text>
            ) : null}
          </View>
          <View>
            <Text style={s.ordenLabel}>ORDEN DE SERVICIO</Text>
            <Text style={s.ordenNum}>#{shortId}</Text>
            <Text style={s.ordenDate}>{dateStr}</Text>
          </View>
        </View>
        <View style={s.goldBar} />

        {/* BODY */}
        <View style={s.body}>
          {/* hero */}
          <View style={s.hero}>
            <View>
              <Text style={s.heroName}>{record.fullName}</Text>
              <Text style={s.heroRut}>RUT: {record.rut || "—"}</Text>
            </View>
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>{serviceLabel}</Text>
            </View>
          </View>

          {/* 1. CONTRATANTE */}
          <Section title="Datos del Contratante">
            <View style={s.grid}>
              <Cell label="Nombre" value={record.familyContact.name} />
              <Cell label="RUT" value={record.familyContact.rut} />
              <Cell label="Teléfono" value={record.familyContact.phone} />
              <Cell label="Correo" value={record.familyContact.email} />
              <Cell
                label="Parentesco"
                value={record.familyContact.relationship}
              />
              <Cell label="Dirección" value={record.familyContact.address} />
            </View>
          </Section>

          {/* 2. FALLECIDO */}
          <Section title="Datos del Fallecido">
            <View style={s.grid}>
              <Cell
                label="Fecha de nacimiento"
                value={fmtDate(record.birthDate)}
              />
              <Cell label="Nacionalidad" value={record.nationality} />
              <Cell label="Estado civil" value={record.civilStatus} />
              <Cell label="Ocupación" value={record.occupation} />
              <Cell label="Previsión de salud" value={record.prevision} />
              <Cell label="Nivel de estudios" value={record.educationLevel} />
              <Cell
                label="Peso"
                value={record.weight ? `${record.weight} kg` : null}
              />
              <Cell
                label="Altura"
                value={record.height ? `${record.height} cm` : null}
              />
              <Cell label="Dirección" value={record.address} full />
            </View>
          </Section>

          {/* 3. FALLECIMIENTO */}
          <Section title="Datos del Fallecimiento">
            <View style={s.grid}>
              <Cell label="Fecha" value={fmtDate(record.deathDate)} />
              <Cell label="Hora" value={record.deathTime} />
              <Cell label="Causa" value={record.deathCause} full />
              <Cell label="Lugar" value={record.deathPlace} full />
            </View>
          </Section>

          {/* 4. SERVICIO */}
          <Section title="Servicio Contratado">
            {serviceItems.length > 0 ? (
              <View style={s.itemsBox}>
                {serviceItems.map((item, i) => (
                  <View
                    key={i}
                    style={
                      i === serviceItems.length - 1 ? s.itemRowLast : s.itemRow
                    }
                  >
                    <View style={s.itemDot} />
                    <Text style={s.itemText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={s.valueMuted}>Sin desglose registrado</Text>
            )}
          </Section>

          {/* 5. EQUIPO TÉCNICO Y FLOTA */}
          {teamStaff.length > 0 || teamVehicles.length > 0 ? (
            <Section title="Equipo Técnico y Flota Asignada">
              <View style={{ flexDirection: "row" }}>
                {teamStaff.length > 0 && (
                  <View style={s.teamCol}>
                    <Text style={s.teamLabel}>PERSONAL TÉCNICO</Text>
                    <View style={s.teamRow}>
                      {teamStaff.map((name, i) => (
                        <View key={i} style={s.teamChip}>
                          <Text style={s.teamChipText}>{name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {teamVehicles.length > 0 && (
                  <View style={s.teamCol}>
                    <Text style={s.teamLabel}>VEHÍCULOS</Text>
                    <View style={s.teamRow}>
                      {teamVehicles.map((label, i) => (
                        <View key={i} style={s.teamChip}>
                          <Text style={s.teamChipText}>{label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </Section>
          ) : null}

          {/* 6. LUGARES */}
          {record.velatorio || record.cemetery || record.crematorium ? (
            <Section title="Lugares del Servicio">
              <View style={s.locRow}>
                {record.velatorio ? (
                  <View style={s.locCard}>
                    <Text style={s.locTitle}>VELATORIO</Text>
                    <Text style={s.locName}>{record.velatorio}</Text>
                    {record.velatorioAddress ? (
                      <Text style={s.locAddr}>{record.velatorioAddress}</Text>
                    ) : null}
                  </View>
                ) : null}
                {record.cemetery ? (
                  <View style={s.locCard}>
                    <Text style={s.locTitle}>CEMENTERIO</Text>
                    <Text style={s.locName}>{record.cemetery}</Text>
                    {record.cemeteryAddress ? (
                      <Text style={s.locAddr}>{record.cemeteryAddress}</Text>
                    ) : null}
                  </View>
                ) : null}
                {record.crematorium ? (
                  <View style={s.locCard}>
                    <Text style={s.locTitle}>CREMATORIO</Text>
                    <Text style={s.locName}>{record.crematorium}</Text>
                    {record.crematoriumAddress ? (
                      <Text style={s.locAddr}>{record.crematoriumAddress}</Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </Section>
          ) : null}

          {/* 6. RELIGIOSO */}
          {(record.religiousPreference &&
            record.religiousPreference !== "ninguna") ||
          record.religiousNotes ? (
            <Section title="Preferencias Religiosas / Culturales">
              <View style={s.grid}>
                <Cell label="Preferencia" value={religiousLabel} />
                <Cell label="Notas" value={record.religiousNotes} />
              </View>
            </Section>
          ) : null}

          {/* 7. URGENCIAS / OBSERVACIONES */}
          {record.urgencies ||
          record.restrictions ||
          record.sensitiveObservations ? (
            <Section title="Urgencias, Restricciones y Observaciones">
              {record.urgencies ? (
                <View>
                  <Text style={s.obsLabel}>URGENCIAS</Text>
                  <View style={s.obsBox}>
                    <Text style={s.obsText}>{record.urgencies}</Text>
                  </View>
                </View>
              ) : null}
              {record.restrictions ? (
                <View>
                  <Text style={s.obsLabel}>RESTRICCIONES</Text>
                  <View style={s.obsBox}>
                    <Text style={s.obsText}>{record.restrictions}</Text>
                  </View>
                </View>
              ) : null}
              {record.sensitiveObservations ? (
                <View>
                  <Text style={s.obsLabel}>OBSERVACIONES SENSIBLES</Text>
                  <View style={s.obsBox}>
                    <Text style={s.obsText}>
                      {record.sensitiveObservations}
                    </Text>
                  </View>
                </View>
              ) : null}
            </Section>
          ) : null}

          {/* FIRMAS */}
          <View style={s.sigRow}>
            <View style={s.sigCol}>
              <View style={s.sigLine} />
              <Text style={s.sigTitle}>Firma del Contratante</Text>
              <Text style={s.sigName}>
                {record.familyContact.name || "_______________"}
              </Text>
            </View>
            <View style={s.sigCol}>
              <View style={s.sigLine} />
              <Text style={s.sigTitle}>Responsable del Servicio</Text>
              <Text style={s.sigName}>
                {record.assignedStaff || "_______________"}
              </Text>
            </View>
            <View style={s.sigCol}>
              <View style={s.sigLine} />
              <Text style={s.sigTitle}>Sello / Timbre</Text>
              <Text style={s.sigName}>
                {record.sucursal || "_______________"}
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={s.footer} fixed>
          <View style={s.footerBar} />
          <View style={s.footerContent}>
            <Text style={s.footerText}>
              Generado el {dateStr} · Orden #{shortId}
            </Text>
            <Text style={s.footerBrand}>VELADESK</Text>
            <Text
              style={s.footerText}
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}
