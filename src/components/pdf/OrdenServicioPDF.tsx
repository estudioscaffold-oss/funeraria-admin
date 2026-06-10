import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { DeceasedRecord } from "../../types";
import { SERVICE_LABELS, RELIGIOUS_LABELS } from "../../utils/mockData";

/* ── fonts ─────────────────────────────────────────────────── */
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff",
      fontWeight: 700,
    },
  ],
});

/* ── palette ────────────────────────────────────────────────── */
const GOLD = "#B8920A";
const GOLD_LIGHT = "#F5EDD4";
const DARK = "#0A1628";
const SLATE = "#475569";
const SLATE_LIGHT = "#94A3B8";
const BORDER = "#E2E8F0";
const WHITE = "#FFFFFF";
const SECTION_BG = "#F8FAFC";

/* ── styles ─────────────────────────────────────────────────── */
const s = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 9,
    color: DARK,
    backgroundColor: WHITE,
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },

  /* header */
  header: {
    backgroundColor: DARK,
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1 },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    color: WHITE,
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize: 7,
    color: GOLD,
    letterSpacing: 3,
    marginTop: 2,
    fontWeight: 600,
  },
  headerRight: { alignItems: "flex-end" },
  ordenLabel: {
    fontSize: 7,
    color: SLATE_LIGHT,
    letterSpacing: 2,
    fontWeight: 600,
  },
  ordenNum: {
    fontSize: 18,
    fontWeight: 700,
    color: GOLD,
    marginTop: 2,
  },
  headerDate: { fontSize: 7.5, color: SLATE_LIGHT, marginTop: 3 },

  /* gold bar */
  goldBar: {
    height: 3,
    backgroundColor: GOLD,
  },

  /* body */
  body: { paddingHorizontal: 40 },

  /* deceased hero */
  deceasedHero: {
    backgroundColor: GOLD_LIGHT,
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeft: `3px solid ${GOLD}`,
  },
  deceasedName: { fontSize: 15, fontWeight: 700, color: DARK },
  deceasedRut: { fontSize: 8.5, color: SLATE, marginTop: 2 },
  statusBadge: {
    backgroundColor: DARK,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: { fontSize: 7.5, color: GOLD, fontWeight: 600, letterSpacing: 1 },

  /* section */
  section: { marginBottom: 14 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 5,
    borderBottom: `1px solid ${BORDER}`,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
    marginRight: 7,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: DARK,
    letterSpacing: 1.2,
  },

  /* grid */
  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 0 },
  cell: {
    width: "50%",
    paddingRight: 10,
    paddingBottom: 8,
  },
  cellFull: {
    width: "100%",
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 7,
    color: SLATE_LIGHT,
    fontWeight: 600,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  fieldValue: { fontSize: 8.5, color: DARK },
  fieldValueEmpty: { fontSize: 8.5, color: SLATE_LIGHT, fontStyle: "italic" },

  /* service items */
  itemsContainer: {
    backgroundColor: SECTION_BG,
    borderRadius: 5,
    padding: 10,
    marginTop: 2,
    border: `1px solid ${BORDER}`,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
    borderBottom: `1px solid ${BORDER}`,
  },
  itemLast: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  itemBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: GOLD,
    marginTop: 2.5,
    marginRight: 8,
    flexShrink: 0,
  },
  itemText: { fontSize: 8.5, color: DARK, flex: 1 },

  /* location card */
  locationCard: {
    backgroundColor: SECTION_BG,
    borderRadius: 5,
    padding: 10,
    border: `1px solid ${BORDER}`,
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    color: GOLD,
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  locationName: { fontSize: 9, fontWeight: 600, color: DARK },
  locationAddress: { fontSize: 8, color: SLATE, marginTop: 2 },

  /* observations */
  obsBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: 5,
    padding: 10,
    border: `1px solid #FDE68A`,
  },
  obsText: { fontSize: 8.5, color: "#92400E", lineHeight: 1.5 },

  /* footer */
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerBar: {
    height: 2,
    backgroundColor: GOLD,
  },
  footerContent: {
    backgroundColor: DARK,
    paddingVertical: 10,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 7, color: SLATE_LIGHT },
  footerBrand: { fontSize: 7, color: GOLD, fontWeight: 600, letterSpacing: 1 },

  /* divider */
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 12 },

  /* page number */
  pageNumber: {
    position: "absolute",
    bottom: 40,
    right: 40,
    fontSize: 7,
    color: SLATE_LIGHT,
  },
});

/* ── helpers ────────────────────────────────────────────────── */
const val = (v?: string | number | null) =>
  v !== undefined && v !== null && v !== "" ? String(v) : null;

const fmtDate = (d?: string) => {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
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
  return `${parseInt(day)} de ${months[parseInt(m) - 1]} de ${y}`;
};

function FieldCell({
  label,
  value,
  full,
}: {
  label: string;
  value?: string | number | null;
  full?: boolean;
}) {
  const v = val(value);
  return (
    <View style={full ? s.cellFull : s.cell}>
      <Text style={s.fieldLabel}>{label.toUpperCase()}</Text>
      {v ? (
        <Text style={s.fieldValue}>{v}</Text>
      ) : (
        <Text style={s.fieldValueEmpty}>—</Text>
      )}
    </View>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <View style={s.sectionDot} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════
   DOCUMENT
══════════════════════════════════════════════════════════════ */
export default function OrdenServicioPDF({
  record,
}: {
  record: DeceasedRecord;
}) {
  const serviceItems = (record.serviceIncludes ?? "")
    .split("\n")
    .filter(Boolean);

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
  const shortId = record.id.slice(-6).toUpperCase();

  return (
    <Document
      title={`Orden de Servicio — ${record.fullName}`}
      author="Veladesk"
      subject="Orden de Servicio Funerario"
    >
      <Page size="A4" style={s.page}>
        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.logoText}>Veladesk</Text>
            <Text style={s.logoSub}>EL CETRO DE CONTROL</Text>
            {record.sucursal ? (
              <Text style={[s.headerDate, { marginTop: 6 }]}>
                Sucursal: {record.sucursal}
              </Text>
            ) : null}
          </View>
          <View style={s.headerRight}>
            <Text style={s.ordenLabel}>ORDEN DE SERVICIO</Text>
            <Text style={s.ordenNum}>#{shortId}</Text>
            <Text style={s.headerDate}>{dateStr}</Text>
          </View>
        </View>
        <View style={s.goldBar} />

        {/* ── BODY ── */}
        <View style={s.body}>
          {/* deceased hero */}
          <View style={s.deceasedHero}>
            <View>
              <Text style={s.deceasedName}>{record.fullName}</Text>
              <Text style={s.deceasedRut}>RUT: {record.rut || "—"}</Text>
            </View>
            <View style={s.statusBadge}>
              <Text style={s.statusText}>
                {(SERVICE_LABELS as Record<string, string>)[
                  record.serviceType
                ] ?? record.serviceType}
              </Text>
            </View>
          </View>

          {/* ── 1. DATOS DEL CONTRATANTE ── */}
          <SectionBlock title="DATOS DEL CONTRATANTE">
            <View style={s.grid2}>
              <FieldCell label="Nombre" value={record.familyContact.name} />
              <FieldCell label="RUT" value={record.familyContact.rut} />
              <FieldCell label="Teléfono" value={record.familyContact.phone} />
              <FieldCell label="Correo" value={record.familyContact.email} />
              <FieldCell
                label="Parentesco"
                value={record.familyContact.relationship}
              />
              <FieldCell
                label="Dirección"
                value={record.familyContact.address}
              />
            </View>
          </SectionBlock>

          {/* ── 2. DATOS DEL FALLECIDO ── */}
          <SectionBlock title="DATOS DEL FALLECIDO">
            <View style={s.grid2}>
              <FieldCell
                label="Fecha de nacimiento"
                value={fmtDate(record.birthDate)}
              />
              <FieldCell label="Nacionalidad" value={record.nationality} />
              <FieldCell label="Estado civil" value={record.civilStatus} />
              <FieldCell label="Ocupación" value={record.occupation} />
              <FieldCell label="Previsión de salud" value={record.prevision} />
              <FieldCell
                label="Nivel de estudios"
                value={record.educationLevel}
              />
              <FieldCell
                label="Peso"
                value={record.weight ? `${record.weight} kg` : null}
              />
              <FieldCell
                label="Altura"
                value={record.height ? `${record.height} cm` : null}
              />
              <FieldCell label="Dirección" value={record.address} full />
            </View>
          </SectionBlock>

          {/* ── 3. DATOS DEL FALLECIMIENTO ── */}
          <SectionBlock title="DATOS DEL FALLECIMIENTO">
            <View style={s.grid2}>
              <FieldCell
                label="Fecha de fallecimiento"
                value={fmtDate(record.deathDate)}
              />
              <FieldCell
                label="Hora de fallecimiento"
                value={record.deathTime}
              />
              <FieldCell
                label="Causa de fallecimiento"
                value={record.deathCause}
                full
              />
              <FieldCell
                label="Lugar de fallecimiento"
                value={record.deathPlace}
                full
              />
            </View>
          </SectionBlock>

          {/* ── 4. SERVICIO CONTRATADO ── */}
          <SectionBlock title="SERVICIO CONTRATADO">
            {serviceItems.length > 0 ? (
              <View style={s.itemsContainer}>
                {serviceItems.map((item, i) => (
                  <View
                    key={i}
                    style={i === serviceItems.length - 1 ? s.itemLast : s.item}
                  >
                    <View style={s.itemBullet} />
                    <Text style={s.itemText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={s.fieldValueEmpty}>Sin desglose registrado</Text>
            )}
          </SectionBlock>

          {/* ── 5. LUGARES DEL SERVICIO ── */}
          {record.velatorio || record.cemetery || record.crematorium ? (
            <SectionBlock title="LUGARES DEL SERVICIO">
              <View style={{ flexDirection: "row", gap: 8 }}>
                {record.velatorio ? (
                  <View style={[s.locationCard, { flex: 1 }]}>
                    <Text style={s.locationTitle}>VELATORIO</Text>
                    <Text style={s.locationName}>{record.velatorio}</Text>
                    {record.velatorioAddress ? (
                      <Text style={s.locationAddress}>
                        {record.velatorioAddress}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
                {record.cemetery ? (
                  <View style={[s.locationCard, { flex: 1 }]}>
                    <Text style={s.locationTitle}>CEMENTERIO</Text>
                    <Text style={s.locationName}>{record.cemetery}</Text>
                    {record.cemeteryAddress ? (
                      <Text style={s.locationAddress}>
                        {record.cemeteryAddress}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
                {record.crematorium ? (
                  <View style={[s.locationCard, { flex: 1 }]}>
                    <Text style={s.locationTitle}>CREMATORIO</Text>
                    <Text style={s.locationName}>{record.crematorium}</Text>
                    {record.crematoriumAddress ? (
                      <Text style={s.locationAddress}>
                        {record.crematoriumAddress}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </SectionBlock>
          ) : null}

          {/* ── 6. PREFERENCIAS RELIGIOSAS ── */}
          {(record.religiousPreference &&
            record.religiousPreference !== "ninguna") ||
          record.religiousNotes ? (
            <SectionBlock title="PREFERENCIAS RELIGIOSAS / CULTURALES">
              <View style={s.grid2}>
                <FieldCell
                  label="Preferencia"
                  value={
                    (RELIGIOUS_LABELS as Record<string, string>)[
                      record.religiousPreference
                    ] ?? record.religiousPreference
                  }
                />
                <FieldCell label="Notas" value={record.religiousNotes} />
              </View>
            </SectionBlock>
          ) : null}

          {/* ── 7. URGENCIAS Y OBSERVACIONES ── */}
          {record.urgencies ||
          record.restrictions ||
          record.sensitiveObservations ? (
            <SectionBlock title="URGENCIAS, RESTRICCIONES Y OBSERVACIONES">
              {record.urgencies ? (
                <View style={{ marginBottom: 6 }}>
                  <Text style={[s.fieldLabel, { marginBottom: 3 }]}>
                    URGENCIAS
                  </Text>
                  <View style={s.obsBox}>
                    <Text style={s.obsText}>{record.urgencies}</Text>
                  </View>
                </View>
              ) : null}
              {record.restrictions ? (
                <View style={{ marginBottom: 6 }}>
                  <Text style={[s.fieldLabel, { marginBottom: 3 }]}>
                    RESTRICCIONES
                  </Text>
                  <View style={s.obsBox}>
                    <Text style={s.obsText}>{record.restrictions}</Text>
                  </View>
                </View>
              ) : null}
              {record.sensitiveObservations ? (
                <View>
                  <Text style={[s.fieldLabel, { marginBottom: 3 }]}>
                    OBSERVACIONES SENSIBLES
                  </Text>
                  <View style={s.obsBox}>
                    <Text style={s.obsText}>
                      {record.sensitiveObservations}
                    </Text>
                  </View>
                </View>
              ) : null}
            </SectionBlock>
          ) : null}

          {/* ── 8. FIRMA ── */}
          <View style={{ marginTop: 24, flexDirection: "row", gap: 24 }}>
            <View style={{ flex: 1, alignItems: "center" }}>
              <View
                style={{
                  height: 1,
                  width: "100%",
                  backgroundColor: BORDER,
                  marginBottom: 6,
                }}
              />
              <Text style={{ fontSize: 7.5, color: SLATE }}>
                Firma del Contratante
              </Text>
              <Text style={{ fontSize: 7, color: SLATE_LIGHT, marginTop: 2 }}>
                {record.familyContact.name || "_______________"}
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <View
                style={{
                  height: 1,
                  width: "100%",
                  backgroundColor: BORDER,
                  marginBottom: 6,
                }}
              />
              <Text style={{ fontSize: 7.5, color: SLATE }}>
                Firma del Responsable
              </Text>
              <Text style={{ fontSize: 7, color: SLATE_LIGHT, marginTop: 2 }}>
                {record.assignedStaff || "_______________"}
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <View
                style={{
                  height: 1,
                  width: "100%",
                  backgroundColor: BORDER,
                  marginBottom: 6,
                }}
              />
              <Text style={{ fontSize: 7.5, color: SLATE }}>
                Sello / Timbre
              </Text>
              <Text style={{ fontSize: 7, color: SLATE_LIGHT, marginTop: 2 }}>
                {record.sucursal || "_______________"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer} fixed>
          <View style={s.footerBar} />
          <View style={s.footerContent}>
            <Text style={s.footerText}>
              Documento generado el {dateStr} · Orden #{shortId}
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
