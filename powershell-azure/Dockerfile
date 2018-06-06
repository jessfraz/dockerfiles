FROM r.j3ss.co/powershell:latest

# Install/Update PowerShellGet
RUN pwsh -c "Install-Module PowerShellGet -Force"

# Install Azure PowerShell module
# Install the Azure Resource Manager modules from the PowerShell Gallery
RUN pwsh -c "Install-Module -Name AzureRM -AllowClobber -Force"

# Install Azure Active Directory module
# Install the Azure Active Directory modules from the PowerShell Gallery
RUN pwsh -c "Install-Module -Name AzureAD -AllowClobber -Force"

ENTRYPOINT [ "pwsh" ]
