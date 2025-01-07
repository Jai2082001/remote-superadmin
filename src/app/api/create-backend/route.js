import { NextResponse } from "next/server";
import { exec } from "child_process";
import path, { parse } from "path";
import fs from "fs";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST(req) {
  try {
    // Parse the request body
    const { resname, dburl } = await req.json();
    console.log(dburl)
    const publicKey = fs.readFileSync(path.join(process.cwd(), './.ssh/id_rsa.pub'), 'utf8');
    if (!resname || !dburl) {
      return NextResponse.json(
        { error: "Missing required parameters: resname, dburl" },
        { status: 400 }
      );
    }

    // Define the path for the main Terraform file
    const tfFilePath = path.join(process.cwd(), "terraform", `main_${resname}.tf`);
    const instanceName = resname.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+$/, "");
   
    // Create the content of the Terraform file dynamically
    const tfContent = `
    variable "restaurant_name_${instanceName}" {
      description = "The name of the restaurant"
      default     = "${resname}"
    }

    locals {
      ssh_public_key_${instanceName}  = "${process.env.PUBLIC_KEY}"
      ssh_private_key_${instanceName} = <<EOF
      ${process.env.PRIVATE_KEY}
      EOF
      ip_${instanceName} = google_compute_instance.restaurant_backend_${instanceName}.network_interface[0].access_config[0].nat_ip
    }

    variable "db_uri_${instanceName}" {
      description = "The database connection string for the restaurant"
      default     = "${dburl}"
    }

    
   resource "google_compute_instance" "restaurant_backend_${instanceName}" {
      name         = "${instanceName}"
      machine_type = "e2-medium"
      zone         = "us-west4-c"
      
      boot_disk {
        initialize_params {
          image = "debian-cloud/debian-11"
        }
      }
      
      tags = ["http-server", "https-server"]

        
      metadata = {
        ssh-keys = "jaideepaz09:${process.env.PUBLIC_KEY}"
      }

      network_interface {
        network = "default"
        access_config {}
      }
 

      metadata_startup_script = <<EOT
echo "PermitRootLogin yes" >> /etc/ssh/sshd_config

EOT
    }

    
    output "instance_ip_${instanceName}" {
      value = google_compute_instance.restaurant_backend_${instanceName}.network_interface[0].access_config[0].nat_ip
    }

    output "db_uri_${instanceName}" {
      value = var.db_uri_${instanceName}
    }
    
    
    `;

    // Write the Terraform content to the new file
    fs.writeFileSync(tfFilePath, tfContent);

    // Run Terraform commands
    await execPromise("terraform init", { cwd: path.join(process.cwd(), "terraform") });
    await execPromise(`terraform apply -auto-approve -target=google_compute_instance.restaurant_backend_${instanceName} -target=null_resource.ansible_playbook_${instanceName}`, {
      cwd: path.join(process.cwd(), "terraform"),
    });

    // Fetch the outputs
    const { stdout: outputs } = await execPromise("terraform output -json", {
      cwd: path.join(process.cwd(), "terraform"),
    });
    const parsedOutputs = JSON.parse(outputs);
    console.log(parsedOutputs)
    const ip = parsedOutputs[`instance_ip_${instanceName}`].value + ',';
    const ip1 = parsedOutputs[`instance_ip_${instanceName}`].value
    const playbook_yaml_path = '/home/jaideepaz09/remote-superadmin/terraform/playbook.yaml'
    const playbook_logs = path.join(process.cwd(), "terraform", `latestplaybook.txt`)

    const ansible_command = `ansible-playbook -i "${ip}" -u jaideepaz09 -vvv `+playbook_yaml_path+ ` -e "DBURL=${dburl} ipaddr=${ip1}"` ;
    console.log('the command is', ansible_command)
    const response = await execPromise(ansible_command)
    console.log(response)
    fs.appendFileSync(playbook_logs, response.stderr)
    
    return NextResponse.json({
      success: true,
      data: {
        instanceIp: parsedOutputs.instance_ip.value,
        dbUri: parsedOutputs.db_uri.value,
      },
    });
  } catch (error) {
    console.error("Error creating backend:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
