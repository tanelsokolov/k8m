{{/*
Create fullname for the chart
*/}}
{{- define "metrics-frontend-lb.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end }}
