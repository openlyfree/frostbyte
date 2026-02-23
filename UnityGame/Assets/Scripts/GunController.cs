using UnityEngine;

public class GunController : MonoBehaviour
{
    
    [System.Serializable]
    public struct WeaponData
    {
        public GameObject model;
        public float fireRate;
        public int damage;
        public bool isAutomatic;
    }

    [Header("Settings")] public Transform firePoint;
    public Camera playerCamera;
    public float range = 100f;
    public LayerMask hitLayers;
    public NetworkManager networkManager;
public ParticleSystem fireParticles;
    [Header("Weapons")] public WeaponData pistol;
    public WeaponData ak;

    private WeaponData _currentWeapon;
    private uint currentWeaponId;
    private float _nextFireTime;
    private bool _isRemote;

    private void Start()
    {
        _currentWeapon = Random.value > 0.5f ? pistol : ak;
        currentWeaponId = _currentWeapon.model == ak.model ? 0u : 1u;
        if (networkManager != null) networkManager.currentWeaponId = currentWeaponId;
        UpdateGunVisuals();
        if (fireParticles != null) ConfigureMuzzleFlash(fireParticles);
    }

    void ConfigureMuzzleFlash(ParticleSystem ps)
    {
        var main = ps.main;
        main.loop = false;
        main.startLifetime = 0.06f;
        main.startSpeed = 0f;
        main.startSize = new ParticleSystem.MinMaxCurve(0.15f, 0.3f);
        main.startColor = new Color(1f, 0.85f, 0.4f, 1f);
        main.maxParticles = 10;
        main.simulationSpace = ParticleSystemSimulationSpace.Local;

        var emission = ps.emission;
        emission.rateOverTime = 0;
        emission.SetBursts(new[] { new ParticleSystem.Burst(0f, 6) });

        var shape = ps.shape;
        shape.shapeType = ParticleSystemShapeType.Cone;
        shape.angle = 15f;
        shape.radius = 0.01f;

        var sol = ps.sizeOverLifetime;
        sol.enabled = true;
        sol.size = new ParticleSystem.MinMaxCurve(1f, AnimationCurve.Linear(0f, 1f, 1f, 0f));

        var col = ps.colorOverLifetime;
        col.enabled = true;
        var gradient = new Gradient();
        gradient.SetKeys(
            new[] { new GradientColorKey(new Color(1f, 0.95f, 0.6f), 0f), new GradientColorKey(new Color(1f, 0.4f, 0f), 1f) },
            new[] { new GradientAlphaKey(1f, 0f), new GradientAlphaKey(0f, 1f) }
        );
        col.color = gradient;

        var renderer = ps.GetComponent<ParticleSystemRenderer>();
        renderer.material = new Material(Shader.Find("Particles/Standard Unlit"));
        renderer.material.SetColor("_Color", new Color(1f, 0.85f, 0.4f, 1f));
        renderer.material.SetFloat("_Mode", 1f); // additive
        renderer.material.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
        renderer.material.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.One);

        var light = ps.lights;
        light.enabled = true;
        light.ratio = 1f;
        light.intensityMultiplier = 2f;
        light.rangeMultiplier = 1.5f;
        light.maxLights = 1;
    }

    private void Update()
    {
        if (_isRemote) return;

        if (Input.GetKeyDown(KeyCode.Alpha1)) SwitchWeapon(ak);
        if (Input.GetKeyDown(KeyCode.Alpha2)) SwitchWeapon(pistol);

        bool inputHeld = _currentWeapon.isAutomatic ? Input.GetMouseButton(0) : Input.GetMouseButtonDown(0);

        if (inputHeld && Time.time >= _nextFireTime)
        {
            Shoot();
        }
    }

    void SwitchWeapon(WeaponData newWeapon)
    {
        _currentWeapon = newWeapon;
        currentWeaponId = _currentWeapon.model == ak.model ? 0u : 1u;
        if (networkManager != null) networkManager.currentWeaponId = currentWeaponId;
        UpdateGunVisuals();
    }

    void UpdateGunVisuals()
    {
        pistol.model.SetActive(_currentWeapon.model == pistol.model);
        ak.model.SetActive(_currentWeapon.model == ak.model);
    }

    // Called by NetworkManager on remote player instances
    public void SetWeaponRemote(uint weaponId)
    {
        _isRemote = true;
        SwitchWeapon(weaponId == 0 ? ak : pistol);
    }

    void Shoot()
    {
        Debug.Log("Shoot triggered!");
        Debug.DrawRay(firePoint.position, firePoint.forward * range, Color.red, 2f);
        _nextFireTime = Time.time + _currentWeapon.fireRate;

        Vector3 shootDir = playerCamera != null ? playerCamera.transform.forward : firePoint.forward;
        if (Physics.Raycast(firePoint.position, shootDir, out RaycastHit hit, range))
        {
            Debug.Log("Hit: " + hit.transform.name);
            if (fireParticles != null) fireParticles.Play();
            networkManager.SendBulletShot(hit.transform.name, _currentWeapon.damage);
    
            if (!networkManager.others.ContainsKey(hit.transform.gameObject.name) && hit.transform.gameObject.name.Contains("Ice"))
            {
                Destroy(hit.transform.gameObject);
            }
        }
    }
}