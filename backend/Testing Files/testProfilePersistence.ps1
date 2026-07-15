# Test Suite: Profile Data Persistence
# Verifies that bio, skills, and resume updates persist in the database

$API_BASE = 'http://localhost:5000/api'
$timestamp = Get-Date -Format 'yyyyMMddHHmmss'
$testEmail = "persistence-test-${timestamp}@test.com"

# Test data
$testUser = @{
    name = 'Test Persistence Candidate'
    email = $testEmail
    password = 'TestPass@123'
    role = 'candidate'
}

$updatedProfile = @{
    bio = 'This is my updated bio for persistence testing'
    skills = @('Node.js', 'React', 'MongoDB', 'AWS')
    name = 'Updated Test Candidate'
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🧪 PROFILE DATA PERSISTENCE TEST SUITE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# TEST 1: Register a new candidate
Write-Host "`n🔐 TEST 1: Registering candidate..." -ForegroundColor Yellow

try {
    $registerResponse = Invoke-WebRequest -Uri "$API_BASE/auth/register" `
        -Method POST `
        -Headers @{ 'Content-Type' = 'application/json' } `
        -Body (ConvertTo-Json $testUser) `
        -SkipHttpErrorCheck

    if ($registerResponse.StatusCode -eq 201) {
        $regData = $registerResponse.Content | ConvertFrom-Json
        $authToken = $regData.data.token
        $candidateId = $regData.data.user._id
        
        Write-Host "✅ Registration successful" -ForegroundColor Green
        Write-Host "   Token: $($authToken.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "   User ID: $candidateId" -ForegroundColor Gray
    } else {
        Write-Host "❌ Registration failed: HTTP $($registerResponse.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Registration error: $_" -ForegroundColor Red
    exit 1
}

# TEST 2: Update profile (bio, skills, name)
Write-Host "`n📝 TEST 2: Updating profile..." -ForegroundColor Yellow

try {
    $headers = @{
        'Authorization' = "Bearer $authToken"
        'Content-Type' = 'application/json'
    }
    
    $updateResponse = Invoke-WebRequest -Uri "$API_BASE/auth/profile" `
        -Method PUT `
        -Headers $headers `
        -Body (ConvertTo-Json $updatedProfile) `
        -SkipHttpErrorCheck

    if ($updateResponse.StatusCode -eq 200) {
        $updateData = $updateResponse.Content | ConvertFrom-Json
        $updatedUser = $updateData.data
        
        Write-Host "✅ Profile update successful" -ForegroundColor Green
        Write-Host "   Bio: $($updatedUser.bio)" -ForegroundColor Gray
        Write-Host "   Skills: $($updatedUser.skills -join ', ')" -ForegroundColor Gray
        Write-Host "   Name: $($updatedUser.name)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Profile update failed: HTTP $($updateResponse.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($updateResponse.Content)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Profile update error: $_" -ForegroundColor Red
    exit 1
}

# TEST 3: Fetch profile and verify persistence
Write-Host "`n🔄 TEST 3: Verifying profile persists after fetch..." -ForegroundColor Yellow

try {
    $headers = @{
        'Authorization' = "Bearer $authToken"
    }
    
    $fetchResponse = Invoke-WebRequest -Uri "$API_BASE/auth/profile" `
        -Method GET `
        -Headers $headers `
        -SkipHttpErrorCheck

    if ($fetchResponse.StatusCode -eq 200) {
        $fetchData = $fetchResponse.Content | ConvertFrom-Json
        $user = $fetchData.data
        
        # Verify all updates persisted
        if ($user.bio -eq $updatedProfile.bio -and `
            $user.name -eq $updatedProfile.name -and `
            ($user.skills | ConvertTo-Json) -eq ($updatedProfile.skills | ConvertTo-Json)) {
            
            Write-Host "✅ Profile data persists correctly" -ForegroundColor Green
            Write-Host "   Bio: $($user.bio)" -ForegroundColor Gray
            Write-Host "   Skills: $($user.skills -join ', ')" -ForegroundColor Gray
            Write-Host "   Name: $($user.name)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Profile data does not match" -ForegroundColor Red
            Write-Host "   Expected bio: $($updatedProfile.bio)" -ForegroundColor Red
            Write-Host "   Got bio: $($user.bio)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Profile fetch failed: HTTP $($fetchResponse.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Profile fetch error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "✅ ALL TESTS PASSED - Profile data persistence verified!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
