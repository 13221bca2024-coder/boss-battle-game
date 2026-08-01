$audioDir = Join-Path $PSScriptRoot 'assets'
New-Item -ItemType Directory -Path $audioDir -Force | Out-Null

function Add-Bytes {
    param(
        [System.Collections.Generic.List[byte]]$Bytes,
        [byte[]]$Data
    )

    if ($null -ne $Data) {
        $Bytes.AddRange($Data)
    }
}

function Add-Int16 {
    param(
        [System.Collections.Generic.List[byte]]$Bytes,
        [int16]$Value
    )

    Add-Bytes -Bytes $Bytes -Data ([System.BitConverter]::GetBytes($Value))
}

function Add-Int32 {
    param(
        [System.Collections.Generic.List[byte]]$Bytes,
        [int]$Value
    )

    Add-Bytes -Bytes $Bytes -Data ([System.BitConverter]::GetBytes($Value))
}

function New-WavFile {
    param(
        [string]$Path,
        [double]$Frequency = 440,
        [double]$DurationSec = 0.35,
        [int]$SampleRate = 22050,
        [double]$Amplitude = 0.2,
        [string]$WaveForm = 'sine'
    )

    $bitsPerSample = 16
    $channels = 1
    $byteRate = $SampleRate * $channels * ($bitsPerSample / 8)
    $blockAlign = $channels * ($bitsPerSample / 8)
    $numSamples = [int][Math]::Floor($SampleRate * $DurationSec)
    $dataSize = $numSamples * $blockAlign

    $bytes = [System.Collections.Generic.List[byte]]::new()

    Add-Bytes -Bytes $bytes -Data ([System.Text.Encoding]::ASCII.GetBytes('RIFF'))
    Add-Int32 -Bytes $bytes -Value (36 + $dataSize)
    Add-Bytes -Bytes $bytes -Data ([System.Text.Encoding]::ASCII.GetBytes('WAVE'))
    Add-Bytes -Bytes $bytes -Data ([System.Text.Encoding]::ASCII.GetBytes('fmt '))
    Add-Int32 -Bytes $bytes -Value 16
    Add-Int16 -Bytes $bytes -Value 1
    Add-Int16 -Bytes $bytes -Value $channels
    Add-Int32 -Bytes $bytes -Value $SampleRate
    Add-Int32 -Bytes $bytes -Value $byteRate
    Add-Int16 -Bytes $bytes -Value $blockAlign
    Add-Int16 -Bytes $bytes -Value $bitsPerSample
    Add-Bytes -Bytes $bytes -Data ([System.Text.Encoding]::ASCII.GetBytes('data'))
    Add-Int32 -Bytes $bytes -Value $dataSize

    for ($i = 0; $i -lt $numSamples; $i++) {
        $t = $i / $SampleRate
        switch ($WaveForm) {
            'square' { $value = if ([Math]::Sin(2 * [Math]::PI * $Frequency * $t) -ge 0) { 1 } else { -1 } }
            'triangle' { $value = 2 * [Math]::Abs(2 * (($t * $Frequency) - [Math]::Floor(($t * $Frequency) + 0.5))) - 1 }
            default { $value = [Math]::Sin(2 * [Math]::PI * $Frequency * $t) }
        }

        $sample = [int]([Math]::Round($value * $Amplitude * 32767))
        if ($sample -gt 32767) { $sample = 32767 }
        if ($sample -lt -32768) { $sample = -32768 }
        Add-Int16 -Bytes $bytes -Value $sample
    }

    [System.IO.File]::WriteAllBytes($Path, $bytes.ToArray())
}

New-WavFile -Path (Join-Path $audioDir 'background-music.wav') -Frequency 440 -DurationSec 1.5 -Amplitude 0.12 -WaveForm 'sine'
New-WavFile -Path (Join-Path $audioDir 'correct.wav') -Frequency 880 -DurationSec 0.25 -Amplitude 0.2 -WaveForm 'square'
New-WavFile -Path (Join-Path $audioDir 'wrong.wav') -Frequency 220 -DurationSec 0.3 -Amplitude 0.18 -WaveForm 'triangle'

Get-ChildItem $audioDir | Select-Object Name, Length
