{{/*
Expand the name of the chart.
*/}}
{{- define "monitoring-stack.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "monitoring-stack.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "monitoring-stack.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "monitoring-stack.labels" -}}
helm.sh/chart: {{ include "monitoring-stack.chart" . }}
{{ include "monitoring-stack.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "monitoring-stack.selectorLabels" -}}
app.kubernetes.io/name: {{ include "monitoring-stack.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Prometheus labels
*/}}
{{- define "monitoring-stack.prometheus.labels" -}}
{{ include "monitoring-stack.labels" . }}
app.kubernetes.io/component: prometheus
{{- end }}

{{/*
Prometheus selector labels
*/}}
{{- define "monitoring-stack.prometheus.selectorLabels" -}}
{{ include "monitoring-stack.selectorLabels" . }}
app.kubernetes.io/component: prometheus
{{- end }}

{{/*
Prometheus fullname
*/}}
{{- define "monitoring-stack.prometheus.fullname" -}}
{{- printf "%s-prometheus" (include "monitoring-stack.fullname" .) }}
{{- end }}

{{/*
Grafana labels
*/}}
{{- define "monitoring-stack.grafana.labels" -}}
{{ include "monitoring-stack.labels" . }}
app.kubernetes.io/component: grafana
{{- end }}

{{/*
Grafana selector labels
*/}}
{{- define "monitoring-stack.grafana.selectorLabels" -}}
{{ include "monitoring-stack.selectorLabels" . }}
app.kubernetes.io/component: grafana
{{- end }}

{{/*
Grafana fullname
*/}}
{{- define "monitoring-stack.grafana.fullname" -}}
{{- printf "%s-grafana" (include "monitoring-stack.fullname" .) }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "monitoring-stack.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "monitoring-stack.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}