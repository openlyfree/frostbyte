using UnityEngine;

public class WaterController : MonoBehaviour
{
    [SerializeField] private NetworkManager networkManager;
    private bool _triggered;

    private void OnTriggerEnter(Collider other)
    {
        if (_triggered || networkManager == null) return;
        if (other.gameObject.name == networkManager._username ||
            other.GetComponentInParent<MovementController>() != null)
        {
            _triggered = true;
            networkManager.SendBulletShot(networkManager._username, 100);

            // Respawn at random position within (0–50, 5, 0–50)
            var root = other.transform.root;
            var rb = root.GetComponent<Rigidbody>();
            if (rb != null) rb.linearVelocity = Vector3.zero;
            root.position = new Vector3(Random.Range(0f, 50f), 5f, Random.Range(0f, 50f));

            Invoke(nameof(ResetTrigger), 1f);
        }
    }

    private void ResetTrigger() => _triggered = false;
}
