using UnityEngine;

public class Ground : MonoBehaviour
{
    public int width = 20, depth = 20;
    public GameObject cubePrefab;

    void Start()
    {
        Random.InitState(167);
        GenerateIrregularIce();
    }

    public void GenerateIrregularIce()
    {
        for (var x = 0; x < width; x++)
        for (var z = 0; z < depth; z++)
        {
            var pos = new Vector3(x * 7f + Random.Range(-1f, 1f), 0, z * 7f + Random.Range(-1f, 1f));

            var ice = Instantiate(cubePrefab, pos, Quaternion.identity);
            ice.name = $"Ice_{x}_{z}";
            ice.isStatic = true;
            ice.transform.localScale = new Vector3(
                Random.Range(5f, 10f),
                0.7f, Random.Range(5f, 10f)
            );
            ice.transform.rotation = Quaternion.Euler(0, Random.Range(0, 360), 0);
        }
    }
}